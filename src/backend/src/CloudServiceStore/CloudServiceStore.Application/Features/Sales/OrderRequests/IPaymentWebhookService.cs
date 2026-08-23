namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public enum PayOsWebhookOutcome
{
    InvalidSignature,
    OrderNotFound,
    AlreadyProcessed,
    Transitioned
}

// Business logic xử lý webhook thanh toán PayOS - tách khỏi PaymentWebhooksController (WebApi) để test
// được ở tầng Application (đúng CLAUDE.md: business logic phải test ở Domain/Application) mà không cần
// dựng HTTP pipeline. Controller chỉ đọc raw body + map PayOsWebhookOutcome sang HTTP status.
public interface IPaymentWebhookService
{
    Task<PayOsWebhookOutcome> HandlePayOsWebhookAsync(string rawJsonBody, CancellationToken cancellationToken = default);
}
