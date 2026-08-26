using CloudServiceStore.Domain.Entities.Sales;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Addon đã thực mua kèm 1 dòng đơn hàng - dùng chung cho response khách hàng (OrderRequestItemDto)
// và tra cứu công khai (OrderLookupItemDto).
public class OrderItemAddonDto
{
    public int AddonId { get; init; }
    public string AddonName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }

    public static OrderItemAddonDto FromEntity(OrderRequestItemAddon addon) => new()
    {
        AddonId = addon.AddonId,
        AddonName = addon.Addon.Name,
        Quantity = addon.Quantity,
        UnitPrice = addon.UnitPrice,
        LineTotal = addon.LineTotal
    };
}
