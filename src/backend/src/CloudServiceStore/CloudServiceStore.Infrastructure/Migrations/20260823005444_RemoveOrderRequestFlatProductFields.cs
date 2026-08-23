using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOrderRequestFlatProductFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_ServicePlans_ServicePlanId",
                table: "OrderRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_TldPricing_TldPricingId",
                table: "OrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_ServicePlanId",
                table: "OrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_TldPricingId",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "DomainName",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "PeriodMonths",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "ServicePlanId",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "TldPricingId",
                table: "OrderRequests");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DomainName",
                table: "OrderRequests",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PeriodMonths",
                table: "OrderRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "OrderRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ServicePlanId",
                table: "OrderRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TldPricingId",
                table: "OrderRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequests_ServicePlanId",
                table: "OrderRequests",
                column: "ServicePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequests_TldPricingId",
                table: "OrderRequests",
                column: "TldPricingId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_ServicePlans_ServicePlanId",
                table: "OrderRequests",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_TldPricing_TldPricingId",
                table: "OrderRequests",
                column: "TldPricingId",
                principalTable: "TldPricing",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
