using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations.Identity;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Email).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(20);
        builder.Property(x => x.CompanyName).HasMaxLength(150);
        builder.Property(x => x.TaxCode).HasMaxLength(20);
        builder.Property(x => x.PendingEmail).HasMaxLength(100);
        builder.Property(x => x.EmailVerificationToken).HasMaxLength(255);
        builder.Property(x => x.PasswordResetToken).HasMaxLength(255);
        builder.Property(x => x.RefreshToken).HasMaxLength(500);
        builder.Property(x => x.CustomerType).HasConversion<int>();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.BillingAddress).HasMaxLength(255);
        builder.Property(x => x.LegalRepresentativeName).HasMaxLength(100);
        builder.Property(x => x.BusinessLicenseNumber).HasMaxLength(50);
        builder.Property(x => x.CreditLimit).HasColumnType("decimal(18,2)");

        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.RoleId);
        builder.HasIndex(x => x.AssignedSalesRepUserId);

        builder.HasOne(x => x.Role)
            .WithMany(x => x.Customers)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AssignedSalesRepUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedSalesRepUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
