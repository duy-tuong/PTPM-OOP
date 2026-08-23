using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderRenewalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "OrderRequestItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RenewalReminderSentAt",
                table: "OrderRequestItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RenewsFromItemId",
                table: "OrderRequestItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequestItems_RenewsFromItemId",
                table: "OrderRequestItems",
                column: "RenewsFromItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequestItems_OrderRequestItems_RenewsFromItemId",
                table: "OrderRequestItems",
                column: "RenewsFromItemId",
                principalTable: "OrderRequestItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequestItems_OrderRequestItems_RenewsFromItemId",
                table: "OrderRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequestItems_RenewsFromItemId",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "RenewalReminderSentAt",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "RenewsFromItemId",
                table: "OrderRequestItems");
        }
    }
}
