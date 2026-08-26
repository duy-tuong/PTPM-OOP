using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Sales;

public class OrderRequestItemAddonConfiguration : IEntityTypeConfiguration<OrderRequestItemAddon>
{
    public void Configure(EntityTypeBuilder<OrderRequestItemAddon> builder)
    {
        builder.ToTable("OrderRequestItemAddons");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.LineTotal).HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.OrderRequestItem)
            .WithMany(x => x.Addons)
            .HasForeignKey(x => x.OrderRequestItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict - không cho xoá cứng 1 Addon đã từng thực mua (bảo toàn lịch sử đơn hàng), xem
        // AdminAddonService.DeleteAsync (chặn xoá tay từ trước, đây là lớp bảo vệ thứ 2 ở tầng DB).
        builder.HasOne(x => x.Addon)
            .WithMany()
            .HasForeignKey(x => x.AddonId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
