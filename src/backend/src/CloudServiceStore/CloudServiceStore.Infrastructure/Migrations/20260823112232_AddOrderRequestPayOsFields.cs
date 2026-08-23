using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderRequestPayOsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PayOsCheckoutUrl",
                table: "OrderRequests",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PayOsLinkExpiresAt",
                table: "OrderRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayOsPaymentLinkId",
                table: "OrderRequests",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayOsQrCode",
                table: "OrderRequests",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PayOsCheckoutUrl",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "PayOsLinkExpiresAt",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "PayOsPaymentLinkId",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "PayOsQrCode",
                table: "OrderRequests");
        }
    }
}
