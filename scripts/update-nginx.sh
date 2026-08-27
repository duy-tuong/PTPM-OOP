#!/usr/bin/env bash
set -e

# Dual-purpose script:
# 1. Chạy thủ công/qua CI/CD sau mỗi lần deploy (xem .github/workflows/main.yml).
# 2. Cài làm Certbot deploy-hook (/etc/letsencrypt/renewal-hooks/deploy/reapply-nginx.sh, xem cùng
#    workflow) - Certbot LUÔN chạy mọi script trong thư mục đó sau khi renew SSL thành công, bất kể
#    plugin nào. Certbot's --nginx plugin có thể tự ghi lại server block riêng theo domain (đè lên cấu
#    hình default_server bên dưới, trỏ nhầm proxy_pass về cổng backend cũ) - hook này đảm bảo Nginx luôn
#    tự phục hồi đúng cấu hình ngay sau mỗi lần renew, không phải đợi tới lần deploy code kế tiếp.
# Vì chạy ở cả 2 ngữ cảnh (SSH session không tương tác của CI/CD, và cron/systemd timer không tương tác
# của Certbot), script phải an toàn khi chạy lặp lại nhiều lần (idempotent) và không cần input nào.

echo "==== Updating Nginx Reverse Proxy Config ===="

# Overwrite EVERY file in /etc/nginx/sites-available/ to ensure Certbot domain configs use port 3000
for f in /etc/nginx/sites-available/*; do
    if [ -f "$f" ]; then
        sudo tee "$f" > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name _;

    ssl_certificate /etc/letsencrypt/live/dichvucloud.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dichvucloud.duckdns.org/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    fi
done

sudo rm -rf /etc/nginx/conf.d/*
sudo rm -rf /etc/nginx/sites-enabled/*
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Purge any remaining references to port 5000 in all Nginx configs
sudo grep -rl "5000" /etc/nginx/ 2>/dev/null | xargs -r sudo sed -i 's/5000/3000/g' || true

sudo nginx -t
sudo systemctl restart nginx || sudo service nginx restart || true
echo "==== Nginx Restarted Successfully! ===="
