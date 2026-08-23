using ClosedXML.Excel;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Infrastructure.Services;

// Xuất Excel bằng ClosedXML (mục 3.2.7 đề bài) — đặt ở Infrastructure vì phụ thuộc thư viện
// tạo file cụ thể, Application chỉ biết tới interface IOrderRequestExportService.
public class OrderRequestExportService : IOrderRequestExportService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderRequestExportService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<byte[]> ExportToExcelAsync(OrderRequestStatus? status, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var orders = await repository.Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .Where(o => status == null || o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("OrderRequests");

        string[] headers =
        [
            "Mã đơn", "Khách hàng", "Email", "Điện thoại", "Công ty",
            "Sản phẩm", "Tổng tiền", "Trạng thái", "Nguồn", "Ngày tạo"
        ];
        for (var col = 0; col < headers.Length; col++)
        {
            worksheet.Cell(1, col + 1).Value = headers[col];
        }
        worksheet.Row(1).Style.Font.Bold = true;

        var row = 2;
        foreach (var order in orders)
        {
            // Đơn nhiều dòng - gộp thành 1 dòng Excel/1 đơn cho gọn (không tách 1 dòng/1 item).
            var productSummary = string.Join("; ", order.Items.Select(i =>
            {
                var name = i.ServicePlan?.Name ?? (i.TldPricing is not null ? $"{i.DomainName}{i.TldPricing.Tld}" : "Sản phẩm");
                return $"{name} x{i.Quantity}";
            }));

            worksheet.Cell(row, 1).Value = order.OrderCode;
            worksheet.Cell(row, 2).Value = order.CustomerName;
            worksheet.Cell(row, 3).Value = order.CustomerEmail;
            worksheet.Cell(row, 4).Value = order.CustomerPhone;
            worksheet.Cell(row, 5).Value = order.CompanyName;
            worksheet.Cell(row, 6).Value = productSummary;
            worksheet.Cell(row, 7).Value = order.TotalPrice;
            worksheet.Cell(row, 8).Value = order.Status.ToString();
            worksheet.Cell(row, 9).Value = order.Source;
            worksheet.Cell(row, 10).Value = order.CreatedAt;
            worksheet.Cell(row, 10).Style.DateFormat.Format = "yyyy-MM-dd HH:mm";
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
