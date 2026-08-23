using CloudServiceStore.Domain.Entities.Sales;

namespace CloudServiceStore.Application.Common.Interfaces;

public class PaymentLinkResult
{
    public string CheckoutUrl { get; init; } = string.Empty;
    public string QrCode { get; init; } = string.Empty;
    public string PaymentLinkId { get; init; } = string.Empty;
    public DateTime? ExpiresAt { get; init; }
}

// OrderCode ở đây là OrderRequest.Id (int, ép sang long cho khớp kiểu OrderCode numeric của PayOS) -
// KHÔNG phải OrderRequest.OrderCode (chuỗi "ORD-..."). Xem PayOsPaymentGatewayService.
public class VerifiedPaymentResult
{
    public long OrderCode { get; init; }
    public long Amount { get; init; }
}

// Port (Dependency Inversion) - Application chỉ biết interface này, không tham chiếu trực tiếp SDK
// payOS (namespace PayOS.*) hay bất kỳ type nào của nó. VerifyWebhookAsync nhận JSON thô (string) thay
// vì type Webhook của SDK để giữ ranh giới đó - PayOsPaymentGatewayService (Infrastructure) tự
// deserialize + verify chữ ký bên trong.
public interface IPaymentGatewayService
{
    Task<PaymentLinkResult> CreatePaymentLinkAsync(OrderRequest order, CancellationToken cancellationToken = default);

    // Trả null nếu chữ ký không hợp lệ/JSON không đúng định dạng - caller (webhook controller) coi đây
    // là request không đáng tin, trả 400 và dừng lại, không xử lý tiếp.
    Task<VerifiedPaymentResult?> VerifyWebhookAsync(string rawJsonBody, CancellationToken cancellationToken = default);

    Task ConfirmWebhookUrlAsync(string webhookUrl, CancellationToken cancellationToken = default);
}
