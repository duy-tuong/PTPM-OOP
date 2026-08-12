using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans;
using CloudServiceStore.Application.Features.Admin.Content.ContentPages;
using CloudServiceStore.Application.Features.Admin.Content.Faqs;
using CloudServiceStore.Application.Features.Admin.Content.NewsArticles;
using CloudServiceStore.Application.Features.Admin.Content.NewsCategories;
using CloudServiceStore.Application.Features.Admin.Marketing.Promotions;
using CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications;
using CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Auth;
using CloudServiceStore.Application.Features.Catalog.ServiceCategories;
using CloudServiceStore.Application.Features.Catalog.ServicePlans;
using CloudServiceStore.Application.Features.Catalog.TldPricings;
using CloudServiceStore.Application.Features.Content.ContentPages;
using CloudServiceStore.Application.Features.Content.Faqs;
using CloudServiceStore.Application.Features.Content.NewsArticles;
using CloudServiceStore.Application.Features.Content.NewsCategories;
using CloudServiceStore.Application.Features.Content.Partners;
using CloudServiceStore.Application.Features.Content.Testimonials;
using CloudServiceStore.Application.Features.Marketing.Promotions;
using CloudServiceStore.Application.Features.Sales.AffiliateApplications;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<OrderStatusNotifier>();

        services.AddScoped<IServiceCategoryService, ServiceCategoryService>();
        services.AddScoped<IServicePlanService, ServicePlanService>();
        services.AddScoped<ITldPricingService, TldPricingService>();
        services.AddScoped<IPromotionService, PromotionService>();
        services.AddScoped<INewsCategoryService, NewsCategoryService>();
        services.AddScoped<INewsArticleService, NewsArticleService>();
        services.AddScoped<IFaqService, FaqService>();
        services.AddScoped<ITestimonialService, TestimonialService>();
        services.AddScoped<IPartnerService, PartnerService>();
        services.AddScoped<IContentPageService, ContentPageService>();

        services.AddScoped<IOrderRequestService, OrderRequestService>();
        services.AddScoped<IConsultationRequestService, ConsultationRequestService>();
        services.AddScoped<IAffiliateApplicationService, AffiliateApplicationService>();

        services.AddScoped<IAdminServiceCategoryService, AdminServiceCategoryService>();
        services.AddScoped<IAdminServicePlanService, AdminServicePlanService>();
        services.AddScoped<IAdminPromotionService, AdminPromotionService>();

        services.AddScoped<IAdminNewsCategoryService, AdminNewsCategoryService>();
        services.AddScoped<IAdminNewsArticleService, AdminNewsArticleService>();
        services.AddScoped<IAdminFaqService, AdminFaqService>();
        services.AddScoped<IAdminContentPageService, AdminContentPageService>();

        services.AddScoped<IAdminOrderRequestService, AdminOrderRequestService>();
        services.AddScoped<IAdminAffiliateApplicationService, AdminAffiliateApplicationService>();
        services.AddScoped<IAdminConsultationRequestService, AdminConsultationRequestService>();

        return services;
    }
}
