namespace CloudServiceStore.Application.Common.Utils;

// Sinh mã yêu cầu ngắn, đủ duy nhất cho lead-capture form (OrderRequest.OrderCode, ConsultationRequest.RequestCode)
// — không cần đảm bảo tuyệt đối duy nhất toàn cục như GUID vì các bảng này không phải giao dịch tài chính.
// Giới hạn tối đa 20 ký tự để khớp HasMaxLength(20) đã cấu hình ở OrderRequestConfiguration/ConsultationRequestConfiguration
// (prefix 3 ký tự + "-" + yyMMddHHmmss 12 số + "-" + 2 số ngẫu nhiên = 19 ký tự).
public static class RequestCodeGenerator
{
    public static string Generate(string prefix)
    {
        return $"{prefix}-{DateTime.UtcNow:yyMMddHHmmss}-{Random.Shared.Next(10, 99)}";
    }
}
