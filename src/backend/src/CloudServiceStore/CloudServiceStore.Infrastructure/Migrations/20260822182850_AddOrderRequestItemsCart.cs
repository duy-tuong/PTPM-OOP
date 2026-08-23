using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderRequestItemsCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrderRequestItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderRequestId = table.Column<int>(type: "int", nullable: false),
                    ServicePlanId = table.Column<int>(type: "int", nullable: true),
                    TldPricingId = table.Column<int>(type: "int", nullable: true),
                    DomainName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PeriodMonths = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderRequestItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderRequestItems_OrderRequests_OrderRequestId",
                        column: x => x.OrderRequestId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderRequestItems_ServicePlans_ServicePlanId",
                        column: x => x.ServicePlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderRequestItems_TldPricing_TldPricingId",
                        column: x => x.TldPricingId,
                        principalTable: "TldPricing",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_OrderRequestId",
                table: "OrderRequestItems",
                column: "OrderRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_ServicePlanId",
                table: "OrderRequestItems",
                column: "ServicePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_TldPricingId",
                table: "OrderRequestItems",
                column: "TldPricingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderRequestItems");
        }
    }
}
