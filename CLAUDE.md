# Quyết định Kiến trúc & Quy chuẩn Code (Project Cloud Service)

Đây là tài liệu hướng dẫn về kiến trúc và quy chuẩn viết code cho toàn bộ dự án Cloud Service (BTL môn PT PM OOP). Tất cả thành viên cần tuân thủ nghiêm ngặt để đảm bảo chất lượng và yêu cầu của giảng viên.

## 1. Kiến trúc Tổng thể (Architecture)

### 1.1 Backend (.NET 8/9 Web API)
- Sử dụng **Clean Architecture** chia làm 4 projects chính:
  1. `CloudServiceStore.Domain`: Chứa các Entities, Enums, Exceptions, và các Interfaces lõi (không phụ thuộc vào thư viện bên ngoài).
  2. `CloudServiceStore.Application`: Chứa Business Logic (Services, UseCases), DTOs, và định nghĩa Interfaces (IRepository, IUnitOfWork).
  3. `CloudServiceStore.Infrastructure`: Tương tác với CSDL, File System, External APIs. Triển khai các Interfaces từ tầng Application (DbContext, Repository implementations).
  4. `CloudServiceStore.WebApi`: Chứa Controllers, Middleware, Configurations, Dependency Injection (DI) setup.
- **ORM:** Entity Framework Core (Khuyến khích kết hợp Dapper cho các câu query phức tạp cần hiệu năng cao).
- **Database:** SQL Server.

### 1.2 Frontend (Next.js)
- Sử dụng **Next.js (App Router)** với TypeScript.
- Data fetching thông qua `fetch` API hoặc `axios`.
- Kết hợp Server-Side Rendering (SSR) / Static Site Generation (SSG) cho các trang public (Landing page, Bảng giá, Blog) để tối ưu SEO.

---

## 2. Quy chuẩn Code Backend (Coding Standards)

### 2.1 Design Principles & Patterns
- Bắt buộc tuân thủ **SOLID Principles** (đặc biệt là Single Responsibility và Dependency Inversion).
- Bắt buộc áp dụng và comment rõ ít nhất **3 Design Patterns**:
  - **Repository Pattern & Unit of Work:** Quản lý truy xuất dữ liệu ở tầng Infrastructure.
  - **Factory Method / Singleton / Observer:** Áp dụng tùy ngữ cảnh (Ví dụ: Factory để tạo các loại gói dịch vụ khác nhau, Singleton cho caching/configuration).

### 2.2 Quy chuẩn REST API
- **Endpoint naming:** Sử dụng danh từ số nhiều (Ví dụ: `GET /api/vps-packages`, `POST /api/orders`).
- **HTTP Status Codes:** Trả về code chuẩn xác (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`).
- **Data Querying:** Phải hỗ trợ Pagination, Filtering, và Sorting cho các danh sách (Ví dụ: Bảng giá, Danh sách user).
- **Error Handling:** Sử dụng **ProblemDetails** chuẩn của .NET để trả về lỗi thống nhất.
- Bắt buộc tích hợp **Swagger/OpenAPI** để document API.

### 2.3 Bảo mật
- **Authentication:** Sử dụng **JWT + Refresh Token**.
- **Authorization:** Phân quyền theo Role (Tối thiểu 2 roles: `Admin`, `Editor`).
- **Mật khẩu:** Phải được băm (hash) bằng `Bcrypt` hoặc `PBKDF2`, tuyệt đối không lưu plaintext.

---

## 3. Quy chuẩn Testing

- **Framework:** `xUnit` kết hợp với `Moq` để mock các dependencies.
- **Phạm vi test:** Tập trung test cho Business Logic ở tầng `Domain` và `Application`.
- **Yêu cầu tối thiểu:** Phải có ít nhất **15 test cases**.
- Đo lường và báo cáo Code Coverage.

---

## 4. Quy trình làm việc (Git Workflow & CI/CD)

### 4.1 Git Flow
- **Không** commit trực tiếp vào nhánh `main`.
- Tạo nhánh riêng cho mỗi tính năng: `feature/[tên-tính-năng]` (Ví dụ: `feature/jwt-auth`, `feature/vps-pricing`).
- Hoàn thiện tính năng -> Tạo Pull Request (PR) -> Cần có ít nhất 1 thành viên review code trước khi Merge.
- Phải có tối thiểu **10 PRs** và tần suất commit đều đặn từ tất cả các thành viên.

### 4.2 CI/CD & Deployment
- Sử dụng **GitHub Actions** để tự động build và chạy Unit Tests mỗi khi có push hoặc PR.
- Có **Dockerfile** cho Web API và cấu hình **docker-compose.yml** để chạy đồng thời API + SQL Server local.
- Cấu hình **Serilog** để ghi log hệ thống.
