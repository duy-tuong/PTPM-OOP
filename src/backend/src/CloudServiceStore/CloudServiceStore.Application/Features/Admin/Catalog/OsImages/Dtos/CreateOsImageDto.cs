using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;

public class CreateOsImageDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public OsFamily Family { get; set; }

    // Chỉ có ý nghĩa khi Family = Windows - validate ở AdminOsImageService (Linux gửi lên giá trị này
    // sẽ bị bỏ qua, không throw, để Admin đổi Family qua lại không mất dữ liệu đã nhập nhầm).
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? WindowsLicenseFeePerMonth { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }
}
