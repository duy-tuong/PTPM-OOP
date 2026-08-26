using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewsArticleIsFeatured : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "NewsArticles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "NewsArticles",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsFeatured",
                value: false);

            migrationBuilder.CreateIndex(
                name: "IX_NewsArticles_IsFeatured_IsPublished_PublishedAt",
                table: "NewsArticles",
                columns: new[] { "IsFeatured", "IsPublished", "PublishedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_NewsArticles_IsFeatured_IsPublished_PublishedAt",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "NewsArticles");
        }
    }
}
