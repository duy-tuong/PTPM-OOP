using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomPlanPackageType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxDiskGb",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxRamMb",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxVcpu",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinDiskGb",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinRamMb",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinVcpu",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PackageType",
                table: "ServicePlans",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Fixed");

            migrationBuilder.AddColumn<decimal>(
                name: "PricePerDiskGbPerMonth",
                table: "ServicePlans",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PricePerRamGbPerMonth",
                table: "ServicePlans",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PricePerVcpuPerMonth",
                table: "ServicePlans",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StepDiskGb",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StepRamMb",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StepVcpu",
                table: "ServicePlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercent",
                table: "PlanPrices",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChosenDiskGb",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChosenRamMb",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChosenVcpu",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 1,
                column: "DiscountPercent",
                value: null);

            migrationBuilder.UpdateData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 2,
                column: "DiscountPercent",
                value: null);

            migrationBuilder.UpdateData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 3,
                column: "DiscountPercent",
                value: null);

            migrationBuilder.UpdateData(
                table: "PlanPrices",
                keyColumn: "Id",
                keyValue: 4,
                column: "DiscountPercent",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxDiskGb", "MaxRamMb", "MaxVcpu", "MinDiskGb", "MinRamMb", "MinVcpu", "PackageType", "PricePerDiskGbPerMonth", "PricePerRamGbPerMonth", "PricePerVcpuPerMonth", "StepDiskGb", "StepRamMb", "StepVcpu" },
                values: new object[] { null, null, null, null, null, null, "Fixed", null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MaxDiskGb", "MaxRamMb", "MaxVcpu", "MinDiskGb", "MinRamMb", "MinVcpu", "PackageType", "PricePerDiskGbPerMonth", "PricePerRamGbPerMonth", "PricePerVcpuPerMonth", "StepDiskGb", "StepRamMb", "StepVcpu" },
                values: new object[] { null, null, null, null, null, null, "Fixed", null, null, null, null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxDiskGb",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "MaxRamMb",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "MaxVcpu",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "MinDiskGb",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "MinRamMb",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "MinVcpu",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "PackageType",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "PricePerDiskGbPerMonth",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "PricePerRamGbPerMonth",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "PricePerVcpuPerMonth",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "StepDiskGb",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "StepRamMb",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "StepVcpu",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "DiscountPercent",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "ChosenDiskGb",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "ChosenRamMb",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "ChosenVcpu",
                table: "OrderRequestItems");
        }
    }
}
