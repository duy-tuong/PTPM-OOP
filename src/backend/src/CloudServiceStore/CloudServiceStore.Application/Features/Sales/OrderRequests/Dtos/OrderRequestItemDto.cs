using CloudServiceStore.Domain.Entities.Sales;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Dùng chung cho response cả khách hàng (MyOrderRequestDto) và Admin (AdminOrderRequestDto).
public class OrderRequestItemDto
{
    public int Id { get; init; }
    public int? ServicePlanId { get; init; }
    public string? ServicePlanName { get; init; }
    public int? TldPricingId { get; init; }
    public string? TldName { get; init; }
    public string? DomainName { get; init; }
    public int? PeriodMonths { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }

    public int? ChosenVcpu { get; init; }
    public int? ChosenRamMb { get; init; }
    public int? ChosenDiskGb { get; init; }

    // "New" | "Renewal" | "PlanChange" - dùng chung cho cả 2 UI (khách hàng/Admin) gắn nhãn rõ loại
    // dòng, tránh hiểu nhầm item "PlanChange" (UnitPrice = số tiền PHỤ THU proration, không phải giá
    // đầy đủ gói đích) là đang mua nguyên gói mới với giá đó. Xem OrderRequestItem.RenewsFromItemId/
    // ChangesFromItemId.
    public string ItemKind { get; init; } = "New";

    // Thông tin bàn giao mô phỏng (Tier 3) - chỉ có giá trị sau khi đơn Completed (xem
    // OrderRequestStatusTransitionService.GenerateProvisioningDetails). Không cần check "chỉ map khi
    // Completed" ở đây - field chỉ được ghi lúc Completed và guard trạng thái kết thúc không cho phép
    // rời khỏi Completed, nên không có state nào field khác null mà Status != Completed.
    public string? ProvisionedIpAddress { get; init; }
    public string? ProvisionedRootPassword { get; init; }
    public string? ProvisionedNameservers { get; init; }
    public DateTime? ProvisionedAt { get; init; }

    public List<OrderItemAddonDto> Addons { get; init; } = new();

    public static OrderRequestItemDto FromEntity(OrderRequestItem item) => new()
    {
        Id = item.Id,
        ServicePlanId = item.ServicePlanId,
        ServicePlanName = item.ServicePlan?.Name,
        TldPricingId = item.TldPricingId,
        TldName = item.TldPricing?.Tld,
        DomainName = item.DomainName,
        PeriodMonths = item.PeriodMonths,
        Quantity = item.Quantity,
        UnitPrice = item.UnitPrice,
        LineTotal = item.LineTotal,
        ChosenVcpu = item.ChosenVcpu,
        ChosenRamMb = item.ChosenRamMb,
        ChosenDiskGb = item.ChosenDiskGb,
        ItemKind = item.ChangesFromItemId is not null ? "PlanChange" : item.RenewsFromItemId is not null ? "Renewal" : "New",
        ProvisionedIpAddress = item.ProvisionedIpAddress,
        ProvisionedRootPassword = item.ProvisionedRootPassword,
        ProvisionedNameservers = item.ProvisionedNameservers,
        ProvisionedAt = item.ProvisionedAt,
        Addons = item.Addons.Select(OrderItemAddonDto.FromEntity).ToList()
    };
}
