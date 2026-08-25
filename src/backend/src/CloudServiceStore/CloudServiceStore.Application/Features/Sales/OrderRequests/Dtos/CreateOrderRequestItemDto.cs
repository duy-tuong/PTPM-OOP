using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class CreateOrderRequestItemDto
{
    public int? ServicePlanId { get; set; }

    public int? TldPricingId { get; set; }

    [MaxLength(100)]
    public string? DomainName { get; set; }

    public int? PeriodMonths { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;

    // Chỉ có ý nghĩa khi ServicePlanId có giá trị - xem OrderRequestService.BuildOrderItemAddonsAsync.
    public List<AddonSelectionDto> Addons { get; set; } = new();

    // Bắt buộc khi ServicePlanId trỏ tới gói Custom (PackageType = Custom), bỏ qua với gói Fixed - xem
    // OrderRequestService.BuildServicePlanItemAsync.
    public int? ChosenVcpu { get; set; }
    public int? ChosenRamMb { get; set; }
    public int? ChosenDiskGb { get; set; }
}
