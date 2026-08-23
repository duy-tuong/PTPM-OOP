using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public class PaymentWebhookService : IPaymentWebhookService
{
    private readonly IPaymentGatewayService _paymentGatewayService;
    private readonly IOrderRequestStatusTransitionService _transitionService;
    private readonly IUnitOfWork _unitOfWork;

    public PaymentWebhookService(
        IPaymentGatewayService paymentGatewayService,
        IOrderRequestStatusTransitionService transitionService,
        IUnitOfWork unitOfWork)
    {
        _paymentGatewayService = paymentGatewayService;
        _transitionService = transitionService;
        _unitOfWork = unitOfWork;
    }

    public async Task<PayOsWebhookOutcome> HandlePayOsWebhookAsync(string rawJsonBody, CancellationToken cancellationToken = default)
    {
        var verified = await _paymentGatewayService.VerifyWebhookAsync(rawJsonBody, cancellationToken);
        if (verified is null)
        {
            return PayOsWebhookOutcome.InvalidSignature;
        }

        // OrderCode PayOS gửi = OrderRequest.Id (xem PayOsPaymentGatewayService.CreatePaymentLinkAsync) -
        // ép ngược lại int an toàn (gốc từ order.Id kiểu int). Ngoài khoảng int - chắc chắn không khớp
        // đơn nào, coi như không tìm thấy thay vì để OverflowException.
        if (verified.OrderCode < int.MinValue || verified.OrderCode > int.MaxValue)
        {
            return PayOsWebhookOutcome.OrderNotFound;
        }

        var order = await _unitOfWork.Repository<OrderRequest, int>().GetByIdAsync((int)verified.OrderCode, cancellationToken);
        if (order is null)
        {
            // Im lặng bỏ qua - PayOS gửi request test (orderCode giả) lúc gọi confirm-webhook, và có thể
            // retry webhook cũ sau khi đơn/DB đã đổi khác đi. Không phải lỗi hệ thống.
            return PayOsWebhookOutcome.OrderNotFound;
        }

        // Guard idempotent - QUAN TRỌNG: OrderRequestStatusTransitionService.TransitionAsync không tự
        // chặn gọi lại Paid khi đơn đã Paid trở lên (chỉ chặn rời khỏi Completed/Cancelled), nên phải tự
        // chặn ở đây. PayOS có thể gọi lại webhook (retry khi endpoint từng lỗi/timeout) - thiếu guard
        // này sẽ gửi trùng email "Đã nhận thanh toán" và ghi đè PaidAt mỗi lần gọi lại.
        var isBeforePaid = order.Status is OrderRequestStatus.New or OrderRequestStatus.Contacted or OrderRequestStatus.Confirmed;
        if (!isBeforePaid)
        {
            return PayOsWebhookOutcome.AlreadyProcessed;
        }

        await _transitionService.TransitionAsync(order.Id, OrderRequestStatus.Paid, changedByUserId: null, cancellationToken);
        return PayOsWebhookOutcome.Transitioned;
    }
}
