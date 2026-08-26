using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServicePlanStatusAndSku : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServicePlans_CategoryId_IsActive",
                table: "ServicePlans");

            migrationBuilder.AddColumn<string>(
                name: "Sku",
                table: "ServicePlans",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            // Status thêm dạng nullable trước - còn phải đọc IsActive để map dữ liệu cũ, chưa thể ép
            // NOT NULL ngay (bản scaffold gốc drop IsActive trước rồi mới add Status mặc định "" cho
            // MỌI row - mất hết dữ liệu bật/tắt của các gói đã tạo ngoài 2 row seed qua HasData).
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ServicePlans",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            // Map cho TOÀN BỘ row hiện có (không chỉ 2 row seed): IsActive=1 -> Active, 0 -> Archived.
            migrationBuilder.Sql(
                "UPDATE ServicePlans SET Status = CASE WHEN IsActive = 1 THEN 'Active' ELSE 'Archived' END");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ServicePlans",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ServicePlans");

            migrationBuilder.CreateIndex(
                name: "IX_ServicePlans_CategoryId_Status",
                table: "ServicePlans",
                columns: new[] { "CategoryId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ServicePlans_Sku",
                table: "ServicePlans",
                column: "Sku",
                unique: true,
                filter: "[Sku] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServicePlans_CategoryId_Status",
                table: "ServicePlans");

            migrationBuilder.DropIndex(
                name: "IX_ServicePlans_Sku",
                table: "ServicePlans");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ServicePlans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                "UPDATE ServicePlans SET IsActive = CASE WHEN Status = 'Active' THEN 1 ELSE 0 END");

            migrationBuilder.DropColumn(
                name: "Sku",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ServicePlans");

            migrationBuilder.CreateIndex(
                name: "IX_ServicePlans_CategoryId_IsActive",
                table: "ServicePlans",
                columns: new[] { "CategoryId", "IsActive" });
        }
    }
}
