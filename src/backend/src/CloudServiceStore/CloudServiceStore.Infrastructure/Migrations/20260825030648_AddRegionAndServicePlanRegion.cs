using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRegionAndServicePlanRegion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RegionId",
                table: "ServicePlans",
                type: "nvarchar(32)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Regions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    City = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Regions",
                columns: new[] { "Id", "City", "CountryCode", "IsActive", "Name" },
                values: new object[,]
                {
                    { "sg-sin-1", "Singapore", "SG", true, "Singapore DC" },
                    { "vn-han-1", "Hà Nội", "VN", true, "Hà Nội DC" },
                    { "vn-sgn-1", "TP. Hồ Chí Minh", "VN", true, "TP.HCM DC" }
                });

            migrationBuilder.UpdateData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 1,
                column: "RegionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 2,
                column: "RegionId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_ServicePlans_RegionId",
                table: "ServicePlans",
                column: "RegionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServicePlans_Regions_RegionId",
                table: "ServicePlans",
                column: "RegionId",
                principalTable: "Regions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServicePlans_Regions_RegionId",
                table: "ServicePlans");

            migrationBuilder.DropTable(
                name: "Regions");

            migrationBuilder.DropIndex(
                name: "IX_ServicePlans_RegionId",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "RegionId",
                table: "ServicePlans");
        }
    }
}
