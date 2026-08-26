using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAddonsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Addons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BillingType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UnitName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PricePerMonth = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderRequestItemAddons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderRequestItemId = table.Column<int>(type: "int", nullable: false),
                    AddonId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderRequestItemAddons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderRequestItemAddons_Addons_AddonId",
                        column: x => x.AddonId,
                        principalTable: "Addons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderRequestItemAddons_OrderRequestItems_OrderRequestItemId",
                        column: x => x.OrderRequestItemId,
                        principalTable: "OrderRequestItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServicePlanAddons",
                columns: table => new
                {
                    PlanId = table.Column<int>(type: "int", nullable: false),
                    AddonId = table.Column<int>(type: "int", nullable: false),
                    MaxQuantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicePlanAddons", x => new { x.PlanId, x.AddonId });
                    table.ForeignKey(
                        name: "FK_ServicePlanAddons_Addons_AddonId",
                        column: x => x.AddonId,
                        principalTable: "Addons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServicePlanAddons_ServicePlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Addons",
                columns: new[] { "Id", "BillingType", "CreatedAt", "IsActive", "Name", "PricePerMonth", "Sku", "Type", "UnitName", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "PerUnit", new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), true, "IPv4 phụ", 30000m, "ADDON-IP-V4", "Ip", "IP", null },
                    { 2, "PerUnit", new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), true, "Ổ đĩa NVMe bổ sung", 2000m, "ADDON-DISK-NVME", "Disk", "GB", null },
                    { 3, "FlatFee", new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), true, "Sao lưu tự động hàng ngày", 50000m, "ADDON-AUTOBACKUP", "ManagedService", null, null },
                    { 4, "FlatFee", new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), true, "Bản quyền Windows Server", 250000m, "ADDON-LIC-WINDOWS", "License", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addons_Sku",
                table: "Addons",
                column: "Sku",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItemAddons_AddonId",
                table: "OrderRequestItemAddons",
                column: "AddonId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItemAddons_OrderRequestItemId",
                table: "OrderRequestItemAddons",
                column: "OrderRequestItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicePlanAddons_AddonId",
                table: "ServicePlanAddons",
                column: "AddonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderRequestItemAddons");

            migrationBuilder.DropTable(
                name: "ServicePlanAddons");

            migrationBuilder.DropTable(
                name: "Addons");
        }
    }
}
