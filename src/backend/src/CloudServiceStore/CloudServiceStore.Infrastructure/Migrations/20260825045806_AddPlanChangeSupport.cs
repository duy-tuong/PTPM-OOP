using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanChangeSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowDowngrade",
                table: "ServicePlans",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "ChangesFromItemId",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 1,
                column: "AllowDowngrade",
                value: true);

            migrationBuilder.UpdateData(
                table: "ServicePlans",
                keyColumn: "Id",
                keyValue: 2,
                column: "AllowDowngrade",
                value: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_ChangesFromItemId",
                table: "OrderRequestItems",
                column: "ChangesFromItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequestItems_OrderRequestItems_ChangesFromItemId",
                table: "OrderRequestItems",
                column: "ChangesFromItemId",
                principalTable: "OrderRequestItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequestItems_OrderRequestItems_ChangesFromItemId",
                table: "OrderRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequestItems_ChangesFromItemId",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "AllowDowngrade",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "ChangesFromItemId",
                table: "OrderRequestItems");
        }
    }
}
