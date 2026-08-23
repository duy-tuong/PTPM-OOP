using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerIdToAffiliateApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "AffiliateApplications",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AffiliateApplications_CustomerId",
                table: "AffiliateApplications",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_AffiliateApplications_Customers_CustomerId",
                table: "AffiliateApplications",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AffiliateApplications_Customers_CustomerId",
                table: "AffiliateApplications");

            migrationBuilder.DropIndex(
                name: "IX_AffiliateApplications_CustomerId",
                table: "AffiliateApplications");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "AffiliateApplications");
        }
    }
}
