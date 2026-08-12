using CloudServiceStore.Application.Common.Utils;

namespace CloudServiceStore.Tests.Common.Utils;

public class SlugGeneratorTests
{
    [Fact]
    public void Generate_MixedCasePunctuation_ReturnsLowercaseDashSeparated()
    {
        var result = SlugGenerator.Generate("VPS SSD Starter!");

        Assert.Equal("vps-ssd-starter", result);
    }

    [Fact]
    public void Generate_AccentedVietnameseLetters_ArePreserved()
    {
        var result = SlugGenerator.Generate("Máy Chủ Ảo");

        Assert.Equal("máy-chủ-ảo", result);
    }

    [Fact]
    public void Generate_LeadingTrailingPunctuation_IsTrimmed()
    {
        var result = SlugGenerator.Generate("  --Hosting Giá Rẻ--  ");

        Assert.Equal("hosting-giá-rẻ", result);
    }
}
