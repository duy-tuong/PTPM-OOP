using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderProvisioningFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "OrderRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProvisioningStartedAt",
                table: "OrderRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProvisionedAt",
                table: "OrderRequestItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProvisionedIpAddress",
                table: "OrderRequestItems",
                type: "nvarchar(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProvisionedNameservers",
                table: "OrderRequestItems",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProvisionedRootPassword",
                table: "OrderRequestItems",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "ProvisioningStartedAt",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "ProvisionedAt",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "ProvisionedIpAddress",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "ProvisionedNameservers",
                table: "OrderRequestItems");

            migrationBuilder.DropColumn(
                name: "ProvisionedRootPassword",
                table: "OrderRequestItems");
        }
    }
}
