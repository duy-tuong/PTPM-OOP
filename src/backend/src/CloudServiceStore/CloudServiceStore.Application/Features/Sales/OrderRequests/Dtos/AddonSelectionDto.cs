using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Addon khách chọn mua kèm 1 dòng ServicePlan trong giỏ hàng - chỉ có ý nghĩa khi item.ServicePlanId
// có giá trị (không áp dụng cho item TLD). Xem OrderRequestService.BuildOrderItemAddonsAsync.
public class AddonSelectionDto
{
    [Required]
    public int AddonId { get; set; }

    [Range(1, 999)]
    public int Quantity { get; set; } = 1;
}
