# Cloudverse — Cloud Service Store

Nền tảng bán dịch vụ Cloud (VPS, Hosting, Domain, SSL, Firewall, Cloud Backup...) theo mô hình thương mại điện tử: khách hàng duyệt bảng giá, đặt hàng, thanh toán qua PayOS (QR chuyển khoản), Admin/Editor quản trị đơn hàng - danh mục - nội dung qua trang quản trị riêng. Đồ án bài tập lớn cuối kỳ môn **Phát triển phần mềm hướng đối tượng** (IN4211).

🌐 **Demo trực tuyến:** https://dichvucloud.duckdns.org

## Kiến trúc hệ thống

### Backend — .NET 10, Clean Architecture

```
CloudServiceStore.Domain           Entities, Enums, Exceptions, Interfaces lõi - không phụ thuộc thư viện ngoài
CloudServiceStore.Application      Business logic (Services), DTOs, Interfaces (IRepository, IUnitOfWork)
CloudServiceStore.Infrastructure   EF Core, Repository/UnitOfWork implementation, Background Services, Email/Payment/Storage
CloudServiceStore.WebApi           Controllers, Middleware, DI, Swagger
```

- **ORM:** Entity Framework Core, SQL Server.
- **34 Domain entities** trải trên 6 nhóm nghiệp vụ (Catalog, Content, Identity, Marketing, Sales, System), **46 REST controllers**.
- **Xác thực:** JWT (access token 30 phút) + Refresh Token (7 ngày, rotate mỗi lần refresh), mật khẩu băm bằng BCrypt.
- **Phân quyền:** 3 role — `Admin`, `Editor`, `Customer`.
- **Background services:** tự động cấp phát dịch vụ sau khi thanh toán (mô phỏng), nhắc gia hạn, dunning (tạm khóa/cảnh báo/hủy dịch vụ quá hạn), dọn dẹp đơn hàng bị bỏ quên.

### Frontend — Next.js 16 (App Router), TypeScript, Tailwind v4

- SSR/SSG cho các trang public (trang chủ, bảng giá, dịch vụ, tin tức) để tối ưu SEO.
- Trang quản trị (`/admin`) và trang khách hàng (`/khach-hang`) render động, bảo vệ qua middleware kiểm tra cookie phiên (tự làm mới token ngầm khi hết hạn).
- Route Handler (`app/api/**`) đóng vai trò proxy có đính kèm Authorization header từ cookie httpOnly, tách biệt hoàn toàn với API backend công khai.

### Design Patterns đã áp dụng (có comment giải thích trực tiếp trong code)

| Pattern | Vị trí |
|---|---|
| **Repository** | [`Repository<TEntity, TKey>`](src/backend/src/CloudServiceStore/CloudServiceStore.Infrastructure/Persistence/Repositories/Repository.cs) |
| **Unit of Work** | [`IUnitOfWork` / `UnitOfWork`](src/backend/src/CloudServiceStore/CloudServiceStore.Infrastructure/Persistence/Repositories/UnitOfWork.cs) |
| **Factory Method** | [`IQrCodeFactory` / `QrCodeFactory`](src/backend/src/CloudServiceStore/CloudServiceStore.Infrastructure/Services/QrCodeFactory.cs) — sinh mã QR thanh toán theo từng gói dịch vụ |
| **Singleton** | [`ISiteSettingsCache` / `SiteSettingsCache`](src/backend/src/CloudServiceStore/CloudServiceStore.Infrastructure/Caching/SiteSettingsCache.cs) — cache cấu hình site |
| **Observer** | [`IOrderStatusObserver` / `OrderStatusNotifier`](src/backend/src/CloudServiceStore/CloudServiceStore.Application/Common/Services/OrderStatusNotifier.cs) + `IConsultationStatusObserver` — mỗi khi đơn hàng/yêu cầu tư vấn đổi trạng thái, 3 observer độc lập (Audit Log, Email, Notification trong app) tự chạy song song |

## Tính năng chính

- **Bảng giá & danh mục:** gói cố định (Fixed) và gói tùy biến kéo thanh trượt (Custom vCPU/RAM/Disk), Add-ons, hệ điều hành (OS Image, có phụ phí bản quyền Windows), Region trang trí, mã giảm giá (Promotion, phân biệt khách mới/cũ).
- **Đặt hàng & thanh toán:** giỏ hàng nhiều dòng, thanh toán qua PayOS (QR/checkout link, webhook xác thực chữ ký, tự làm mới link hết hạn), Price Versioning/Grandfathering khi gia hạn, Proration khi đổi gói giữa chu kỳ.
- **Vòng đời đơn hàng:** New → Contacted → Confirmed → Paid → Provisioning → Completed / Cancelled, tự động bàn giao (mô phỏng cấp IP/mật khẩu root hoặc SSH key), khách tự hủy/thanh toán lại đơn chưa xử lý, Admin cảnh báo khi hủy đơn đã thu tiền.
- **Dunning Automation:** tự tạm khóa → cảnh báo → hủy dịch vụ quá hạn thanh toán; tự hủy đơn hàng chưa thanh toán bị bỏ quên quá lâu.
- **Fraud Review** (rule-based): gắn cờ đơn hàng bất thường để Admin duyệt tay, không chặn tự động.
- **CRM & Revenue Analytics:** hồ sơ khách hàng B2B, gán nhân viên phụ trách, MRR/ARR/Churn/LTV/AR Aging.
- **Nội dung:** Tin tức (tag cloud, bài nổi bật, related articles theo điểm số), Giới thiệu (timeline công ty, giá trị cốt lõi, thống kê thật), FAQ, Testimonials, Đối tác.
- **Thông báo:** email tự động theo từng mốc trạng thái, chuông thông báo trong app, trang "Đơn hàng của tôi" tự làm mới.

## Bắt đầu nhanh với Docker Compose

Yêu cầu: Docker + Docker Compose.

```bash
git clone <repo-url>
cd Project_BTL
cp .env.example .env      # điền JWT_SECRET_KEY, DB_SA_PASSWORD, khóa PayOS/Resend (xem chú thích trong file)
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- SQL Server: `localhost:1433` (container tự chạy migration khi khởi động)

Tài khoản Admin mặc định (seed sẵn): `admin@cloudservicestore.local` / `Admin@123`.

## Chạy thủ công cho phát triển (không dùng Docker)

### Backend

```bash
cd src/backend/src/CloudServiceStore/CloudServiceStore.WebApi
# Cấu hình appsettings.Development.json: ConnectionStrings:DefaultConnection trỏ tới SQL Server local
dotnet run
```

Ứng dụng tự chạy migration khi khởi động (`Database.MigrateAsync()` trong `Program.cs`), không cần chạy `dotnet ef` tay. Mặc định chạy ở `http://localhost:5137`, Swagger UI tại `/swagger`.

### Frontend

```bash
cd src/frontend
cp .env.example .env.local   # trỏ API_URL/NEXT_PUBLIC_API_URL về backend local (mặc định http://localhost:5137/api)
npm install
npm run dev
```

Chạy ở `http://localhost:3000`.

## Biến môi trường

| File | Dùng cho | Ghi chú |
|---|---|---|
| `.env` (root, xem `.env.example`) | Docker Compose | `DB_SA_PASSWORD`, `JWT_SECRET_KEY`, khóa PayOS (`App__PayOsClientId/ApiKey/ChecksumKey`), khóa Resend (`App__ResendApiKey`) — **không commit**, đã có trong `.gitignore` |
| `src/backend/.../appsettings.Development.json` | Chạy `dotnet run` local | Connection string SQL Server local + các khóa dev |
| `src/frontend/.env.local` (xem `.env.example`) | Chạy `npm run dev` | `API_URL` (server-side), `NEXT_PUBLIC_API_URL` (browser-side) |

## Kiểm thử

```bash
cd src/backend
dotnet test tests/CloudServiceStore.Tests/CloudServiceStore.Tests.csproj
```

371 test case (xUnit + Moq), tập trung vào Business Logic ở tầng `Domain`/`Application`, dùng EF Core InMemory provider để test các service/background service không cần SQL Server thật.

```bash
cd src/frontend
npx tsc --noEmit && npm run lint && npm run build
```

## CI/CD

`.github/workflows/main.yml` — GitHub Actions tự động build + chạy toàn bộ unit test mỗi lần push/PR; khi merge vào `main`, tự SSH deploy lên VM (build lại Docker image, chạy migration, cập nhật cấu hình Nginx, smoke-test xác nhận domain phục vụ đúng qua Next.js trước khi báo thành công).

## Cấu trúc thư mục

```
Project_BTL/
├── docker-compose.yml          # SQL Server + Backend + Frontend
├── docker/                     # Cấu hình phụ trợ Docker
├── scripts/                    # Script deploy (Nginx)
├── docs/                       # Tài liệu đề bài, thiết kế nghiệp vụ
├── .github/workflows/          # CI/CD
└── src/
    ├── backend/
    │   ├── src/CloudServiceStore/
    │   │   ├── CloudServiceStore.Domain/
    │   │   ├── CloudServiceStore.Application/
    │   │   ├── CloudServiceStore.Infrastructure/
    │   │   └── CloudServiceStore.WebApi/
    │   └── tests/CloudServiceStore.Tests/
    └── frontend/
        ├── app/                # Next.js App Router (route theo nhóm: public, admin, khach-hang, api)
        ├── components/
        └── lib/
```

## Git Workflow

- Không commit trực tiếp vào `main` — tạo nhánh `feature/[tên-tính-năng]`, mở Pull Request, cần ít nhất 1 review trước khi merge.
- GitHub Actions tự chạy build + unit test trên mỗi PR.

## Giấy phép

Đồ án học thuật, thực hiện trong khuôn khổ môn PT PM OOP — không phát hành thương mại.
