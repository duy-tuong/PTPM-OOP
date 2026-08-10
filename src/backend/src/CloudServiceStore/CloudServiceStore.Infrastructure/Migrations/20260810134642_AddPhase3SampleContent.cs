using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase3SampleContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "AuthorId", "Content", "CreatedAt", "DeletedAt", "DisplayOrder", "IsDeleted", "IsPublished", "MetaDescription", "MetaTitle", "PublishedAt", "Slug", "Title", "UpdatedAt" },
                values: new object[] { 1, new Guid("00000000-0000-0000-0000-000000000001"), "CloudServiceStore là đơn vị cung cấp hạ tầng cloud (VPS, Hosting, Domain, Email doanh nghiệp, SSL, Firewall chống DDoS) với cam kết uptime 99.9%.", new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, false, true, "Tìm hiểu về lịch sử, hạ tầng và cam kết SLA của CloudServiceStore.", "Giới thiệu - CloudServiceStore", new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "gioi-thieu", "Giới thiệu về CloudServiceStore", null });

            migrationBuilder.InsertData(
                table: "Faqs",
                columns: new[] { "Id", "Answer", "CreatedAt", "DeletedAt", "DisplayOrder", "IsActive", "IsDeleted", "Question", "ServiceCategoryId", "UpdatedAt" },
                values: new object[] { 1, "VPS SSD cấp cho bạn tài nguyên riêng (CPU/RAM/SSD) và quyền quản trị toàn bộ máy chủ ảo, trong khi Hosting dùng chung tài nguyên với nhiều khách hàng khác.", new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, true, false, "VPS SSD khác gì Hosting thông thường?", 1, null });

            migrationBuilder.InsertData(
                table: "NewsCategories",
                columns: new[] { "Id", "DeletedAt", "Description", "DisplayOrder", "IsActive", "IsDeleted", "Name", "Slug" },
                values: new object[] { 1, null, "Tin tức khuyến mãi, ưu đãi mới nhất.", 1, true, false, "Khuyến mãi", "khuyen-mai" });

            migrationBuilder.InsertData(
                table: "Partners",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "DisplayOrder", "IsActive", "IsDeleted", "LogoUrl", "Name", "WebsiteUrl" },
                values: new object[] { 1, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, true, false, "https://cloudservicestore.local/partners/techcorp.png", "TechCorp Vietnam", "https://techcorp.example.com" });

            migrationBuilder.InsertData(
                table: "Promotions",
                columns: new[] { "Id", "Code", "CreatedAt", "DeletedAt", "Description", "DiscountType", "DiscountValue", "EndDate", "IsActive", "IsDeleted", "MaxDiscountAmount", "MinOrderValue", "Name", "StartDate", "UpdatedAt", "UsageCount", "UsageLimit" },
                values: new object[] { 1, "WELCOME2026", new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giảm giá cho khách hàng đăng ký mới trong năm 2026.", 1, 10m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, false, 500000m, null, "Ưu đãi chào năm mới 2026", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 0, null });

            migrationBuilder.InsertData(
                table: "ServicePlans",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "DeletedAt", "Description", "DisplayOrder", "IsActive", "IsDeleted", "IsFeatured", "Name", "QrCodeUrl", "ShortDescription", "Slug", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gói VPS SSD Starter phù hợp cho website cá nhân, blog, ứng dụng nhỏ cần tài nguyên vừa phải.", 1, true, false, false, "VPS SSD Starter", null, "Khởi đầu tiết kiệm cho website/app nhỏ.", "vps-ssd-starter", null },
                    { 2, 1, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gói VPS SSD Business dành cho ứng dụng doanh nghiệp cần hiệu năng ổn định, tài nguyên lớn.", 2, true, false, true, "VPS SSD Business", null, "Hiệu năng cao cho doanh nghiệp.", "vps-ssd-business", null }
                });

            migrationBuilder.InsertData(
                table: "Testimonials",
                columns: new[] { "Id", "AvatarUrl", "CompanyName", "Content", "CreatedAt", "CustomerId", "DeletedAt", "DisplayName", "DisplayOrder", "IsActive", "IsDeleted", "Rating" },
                values: new object[] { 1, null, "Công ty TNHH ABC", "Dịch vụ VPS ổn định, hỗ trợ kỹ thuật nhanh chóng. Rất hài lòng!", new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "Nguyễn Văn A", 1, true, false, 5 });

            migrationBuilder.InsertData(
                table: "NewsArticles",
                columns: new[] { "Id", "AuthorId", "Content", "CreatedAt", "DeletedAt", "IsDeleted", "IsPublished", "NewsCategoryId", "PublishedAt", "Slug", "Summary", "ThumbnailUrl", "Title", "UpdatedAt", "ViewCount" },
                values: new object[] { 1, new Guid("00000000-0000-0000-0000-000000000001"), "Nhân dịp đầu năm 2026, CloudServiceStore triển khai chương trình ưu đãi giảm giá lên đến 10% cho toàn bộ gói VPS SSD. Chương trình áp dụng cho khách hàng đăng ký mới trong suốt năm 2026.", new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), null, false, true, 1, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "ra-mat-uu-dai-vps-dau-nam-2026", "Giảm giá đến 10% cho các gói VPS SSD trong tháng 1/2026.", null, "Ra mắt chương trình ưu đãi VPS đầu năm 2026", null, 0 });

            migrationBuilder.InsertData(
                table: "PlanFeatures",
                columns: new[] { "Id", "DisplayOrder", "FeatureKey", "FeatureLabel", "FeatureUnit", "FeatureValueNumeric", "FeatureValueText", "IsHighlighted", "PlanId" },
                values: new object[,]
                {
                    { 1, 1, "cpu", "CPU", "core", 1m, "1 vCPU", false, 1 },
                    { 2, 2, "ram", "RAM", "GB", 1m, "1 GB", false, 1 },
                    { 3, 3, "ssd", "Ổ cứng SSD", "GB", 20m, "20 GB", false, 1 },
                    { 4, 1, "cpu", "CPU", "core", 4m, "4 vCPU", true, 2 },
                    { 5, 2, "ram", "RAM", "GB", 8m, "8 GB", true, 2 },
                    { 6, 3, "ssd", "Ổ cứng SSD", "GB", 120m, "120 GB", false, 2 }
                });

            migrationBuilder.InsertData(
                table: "PlanPrices",
                columns: new[] { "Id", "CreatedAt", "Currency", "IsActive", "IsDefault", "PeriodMonths", "PlanId", "Price", "PromotionalPrice", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "VND", true, true, 1, 1, 99000m, null, null },
                    { 2, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "VND", true, false, 12, 1, 1069000m, 990000m, null },
                    { 3, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "VND", true, true, 1, 2, 299000m, null, null },
                    { 4, new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "VND", true, false, 12, 2, 3229000m, 2990000m, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Faqs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "NewsArticles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Partners",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PlanFeatures",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PlanFeatures",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PlanFeatures",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "PlanFeatures",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "PlanFeatures",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "PlanFeatures",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Testimonials",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "NewsCategories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
