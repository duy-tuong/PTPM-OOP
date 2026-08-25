using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOsImageCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OsImageId",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OsImageName",
                table: "OrderRequestItems",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OsLicenseFee",
                table: "OrderRequestItems",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OsImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Family = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    WindowsLicenseFeePerMonth = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OsImages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServicePlanOsImages",
                columns: table => new
                {
                    PlanId = table.Column<int>(type: "int", nullable: false),
                    OsImageId = table.Column<int>(type: "int", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicePlanOsImages", x => new { x.PlanId, x.OsImageId });
                    table.ForeignKey(
                        name: "FK_ServicePlanOsImages_OsImages_OsImageId",
                        column: x => x.OsImageId,
                        principalTable: "OsImages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServicePlanOsImages_ServicePlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "OsImages",
                columns: new[] { "Id", "CreatedAt", "DisplayOrder", "Family", "IsActive", "Name", "Slug", "UpdatedAt", "WindowsLicenseFeePerMonth" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Linux", true, "Ubuntu 24.04 LTS", "ubuntu-24-04", null, null },
                    { 2, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Linux", true, "Ubuntu 22.04 LTS", "ubuntu-22-04", null, null },
                    { 3, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 3, "Linux", true, "Debian 12", "debian-12", null, null },
                    { 4, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 4, "Linux", true, "AlmaLinux 9", "almalinux-9", null, null },
                    { 5, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 5, "Linux", true, "Rocky Linux 9", "rocky-linux-9", null, null },
                    { 6, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 6, "Windows", true, "Windows Server 2022 Standard", "windows-server-2022", null, 350000m },
                    { 7, new DateTime(2026, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), 7, "Windows", true, "Windows Server 2019 Standard", "windows-server-2019", null, 300000m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_OsImageId",
                table: "OrderRequestItems",
                column: "OsImageId");

            migrationBuilder.CreateIndex(
                name: "IX_OsImages_Slug",
                table: "OsImages",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServicePlanOsImages_OsImageId",
                table: "ServicePlanOsImages",
                column: "OsImageId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequestItems_OsImages_OsImageId",
                table: "OrderRequestItems",
                column: "OsImageId",
                principalTable: "OsImages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequestItems_OsImages_OsImageId",
                table: "OrderRequestItems");

            migrationBuilder.DropTable(
                name: "ServicePlanOsImages");

            migrationBuilder.DropTable(
                name: "OsImages");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequestItems_OsImageId",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "OsImageId",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "OsImageName",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "OsLicenseFee",
                table: "OrderRequestItems");
        }
    }
}
