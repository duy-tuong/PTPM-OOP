#!/usr/bin/env bash
set -e

echo "==== Updating Nginx Reverse Proxy Config ===="
# Purge any stale proxy rules pointing to port 5000 anywhere in /etc/nginx/
sudo grep -rl "5000" /etc/nginx/ 2>/dev/null | xargs -r sudo sed -i 's/5000/3000/g' || true

sudo rm -rf /etc/nginx/conf.d/*
sudo rm -rf /etc/nginx/sites-enabled/*

sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
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

sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx || sudo service nginx restart || true
echo "==== Nginx Restarted Successfully! ===="
