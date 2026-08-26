using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanPriceVersioningAndGrandfathering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Default TRUE (khác bản scaffold gốc mặc định false) - áp dụng cho MỌI ServicePlan hiện có,
            // không chỉ 2 row seed qua HasData: trước khi có tính năng này, chưa plan nào từng "tắt"
            // Grandfathering (policy mới, mặc định bật đúng như C# property default trên ServicePlan.cs).
            migrationBuilder.AddColumn<bool>(
                name: "AllowGrandfatheredRenewal",
                table: "ServicePlans",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EffectiveFrom",
                table: "PlanPrices",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<DateTime>(
                name: "EffectiveTo",
                table: "PlanPrices",
                type: "datetime2",
                nullable: true);

            // Default TRUE/1 (khác bản scaffold gốc mặc định false/0) - áp dụng cho MỌI PlanPrice hiện
            // có, không chỉ 4 row seed: trước khi có Price Versioning, mọi row đang tồn tại ĐỀU đang là
            // giá hiện hành duy nhất cho PeriodMonths của nó (không có gì để "đóng version" cả).
            migrationBuilder.AddColumn<bool>(
                name: "IsCurrent",
                table: "PlanPrices",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "PlanPrices",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "PlanPriceId",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            // EffectiveFrom chính xác hơn GETUTCDATE() (thời điểm chạy migration) cho dữ liệu ĐÃ tồn tại
            // từ trước - lấy đúng CreatedAt gốc của từng row thay vì "bây giờ".
            migrationBuilder.Sql("UPDATE PlanPrices SET EffectiveFrom = CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPrices_PlanId_IsCurrent",
                table: "PlanPrices",
                columns: new[] { "PlanId", "IsCurrent" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_PlanPriceId",
                table: "OrderRequestItems",
                column: "PlanPriceId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequestItems_PlanPrices_PlanPriceId",
                table: "OrderRequestItems",
                column: "PlanPriceId",
                principalTable: "PlanPrices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequestItems_PlanPrices_PlanPriceId",
                table: "OrderRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_PlanPrices_PlanId_IsCurrent",
                table: "PlanPrices");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequestItems_PlanPriceId",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "AllowGrandfatheredRenewal",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "EffectiveFrom",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "EffectiveTo",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "IsCurrent",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "PlanPriceId",
                table: "OrderRequestItems");
        }
    }
}
