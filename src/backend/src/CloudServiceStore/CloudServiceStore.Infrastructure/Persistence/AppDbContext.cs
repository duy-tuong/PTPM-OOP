using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Content;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Identity
    public DbSet<AppRole> AppRoles => Set<AppRole>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<AppUserRole> AppUserRoles => Set<AppUserRole>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerSshKey> CustomerSshKeys => Set<CustomerSshKey>();

    // System
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Catalog
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<ServicePlan> ServicePlans => Set<ServicePlan>();
    public DbSet<PlanFeature> PlanFeatures => Set<PlanFeature>();
    public DbSet<PlanPrice> PlanPrices => Set<PlanPrice>();
    public DbSet<TldPricing> TldPricings => Set<TldPricing>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Addon> Addons => Set<Addon>();
    public DbSet<ServicePlanAddon> ServicePlanAddons => Set<ServicePlanAddon>();
    public DbSet<OsImage> OsImages => Set<OsImage>();
    public DbSet<ServicePlanOsImage> ServicePlanOsImages => Set<ServicePlanOsImage>();

    // Marketing
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<PromotionScope> PromotionScopes => Set<PromotionScope>();

    // Sales
    public DbSet<OrderRequest> OrderRequests => Set<OrderRequest>();
    public DbSet<OrderRequestItem> OrderRequestItems => Set<OrderRequestItem>();
    public DbSet<OrderRequestItemAddon> OrderRequestItemAddons => Set<OrderRequestItemAddon>();
    public DbSet<ConsultationRequest> ConsultationRequests => Set<ConsultationRequest>();
    public DbSet<AffiliateApplication> AffiliateApplications => Set<AffiliateApplication>();

    // Content
    public DbSet<ContentPage> ContentPages => Set<ContentPage>();
    public DbSet<NewsCategory> NewsCategories => Set<NewsCategory>();
    public DbSet<NewsArticle> NewsArticles => Set<NewsArticle>();
    public DbSet<NewsTag> NewsTags => Set<NewsTag>();
    public DbSet<NewsArticleTag> NewsArticleTags => Set<NewsArticleTag>();
    public DbSet<NewsComment> NewsComments => Set<NewsComment>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<Partner> Partners => Set<Partner>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
