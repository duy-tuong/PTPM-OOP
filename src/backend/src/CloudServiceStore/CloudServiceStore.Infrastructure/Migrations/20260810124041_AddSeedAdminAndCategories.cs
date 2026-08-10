using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSeedAdminAndCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AppUsers",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "Email", "FullName", "IsActive", "IsDeleted", "PasswordHash", "PhoneNumber", "RefreshToken", "RefreshTokenExpiryTime", "UpdatedAt", "Username" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, "admin@cloudservicestore.local", "System Administrator", true, false, "$2a$12$5HZRDTIWE.Z5SFHppw.joeiJgmEq4xF8SPF842cptbiiRInG7YAHy", null, null, null, null, "admin" });

            migrationBuilder.InsertData(
                table: "ServiceCategories",
                columns: new[] { "Id", "DeletedAt", "Description", "DisplayOrder", "IconUrl", "IsActive", "IsDeleted", "Name", "Slug" },
                values: new object[,]
                {
                    { 1, null, "Máy chủ ảo hiệu năng cao, nhiều cấu hình CPU/RAM/SSD.", 1, null, true, false, "VPS", "vps" },
                    { 2, null, "Lưu trữ website, hỗ trợ đa nền tảng (WordPress, PHP, .NET...).", 2, null, true, false, "Hosting", "hosting" },
                    { 3, null, "Đăng ký và quản lý tên miền với nhiều đuôi phổ biến.", 3, null, true, false, "Domain", "domain" },
                    { 4, null, "Email theo tên miền riêng, bảo mật và chuyên nghiệp.", 4, null, true, false, "Email doanh nghiệp", "email-doanh-nghiep" },
                    { 5, null, "Chứng chỉ bảo mật SSL/TLS cho website.", 5, null, true, false, "SSL", "ssl" },
                    { 6, null, "Giải pháp tường lửa và chống tấn công DDoS.", 6, null, true, false, "Firewall chống DDoS", "firewall-chong-ddos" }
                });

            migrationBuilder.InsertData(
                table: "AppUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { 1, new Guid("00000000-0000-0000-0000-000000000001") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AppUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, new Guid("00000000-0000-0000-0000-000000000001") });

            migrationBuilder.DeleteData(
                table: "ServiceCategories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ServiceCategories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ServiceCategories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ServiceCategories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ServiceCategories",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "ServiceCategories",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "AppUsers",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));
        }
    }
}
