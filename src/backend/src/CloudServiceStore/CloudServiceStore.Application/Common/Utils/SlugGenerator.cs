using System.Text.RegularExpressions;

namespace CloudServiceStore.Application.Common.Utils;

// Slug hoá đơn giản (lowercase, khoảng trắng/ký tự lạ -> "-") — không strip dấu tiếng Việt
// (đủ dùng cho slug tự sinh của tag/URL nội bộ; Admin vẫn có thể tự nhập slug riêng ở các form khác).
public static class SlugGenerator
{
    public static string Generate(string input)
    {
        var lower = input.Trim().ToLowerInvariant();
        var slug = Regex.Replace(lower, @"[^\p{L}\p{N}]+", "-").Trim('-');
        return slug;
    }
}
