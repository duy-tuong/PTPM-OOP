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
            .Include(o => o.ServicePlan)
            .Include(o => o.TldPricing)
            .Where(o => status == null || o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("OrderRequests");

        string[] headers =
        [
            "Mã đơn", "Khách hàng", "Email", "Điện thoại", "Công ty",
            "Sản phẩm", "Kỳ hạn (tháng)", "Số lượng", "Tổng tiền",
            "Trạng thái", "Nguồn", "Ngày tạo"
        ];
        for (var col = 0; col < headers.Length; col++)
        {
            worksheet.Cell(1, col + 1).Value = headers[col];
        }
        worksheet.Row(1).Style.Font.Bold = true;

        var row = 2;
        foreach (var order in orders)
        {
            worksheet.Cell(row, 1).Value = order.OrderCode;
            worksheet.Cell(row, 2).Value = order.CustomerName;
            worksheet.Cell(row, 3).Value = order.CustomerEmail;
            worksheet.Cell(row, 4).Value = order.CustomerPhone;
            worksheet.Cell(row, 5).Value = order.CompanyName;
            worksheet.Cell(row, 6).Value = order.ServicePlan?.Name
                ?? (order.DomainName is not null && order.TldPricing is not null ? order.DomainName + order.TldPricing.Tld : null);
            worksheet.Cell(row, 7).Value = order.PeriodMonths;
            worksheet.Cell(row, 8).Value = order.Quantity;
            worksheet.Cell(row, 9).Value = order.TotalPrice;
            worksheet.Cell(row, 10).Value = order.Status.ToString();
            worksheet.Cell(row, 11).Value = order.Source;
            worksheet.Cell(row, 12).Value = order.CreatedAt;
            worksheet.Cell(row, 12).Style.DateFormat.Format = "yyyy-MM-dd HH:mm";
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
