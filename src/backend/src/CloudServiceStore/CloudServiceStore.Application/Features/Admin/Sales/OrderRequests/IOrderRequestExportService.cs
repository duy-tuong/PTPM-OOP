using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;

public interface IOrderRequestExportService
{
    // Trả về nội dung file .xlsx (byte[]) — controller tự set Content-Type/tên file khi trả response.
    Task<byte[]> ExportToExcelAsync(OrderRequestStatus? status, CancellationToken cancellationToken = default);
}
