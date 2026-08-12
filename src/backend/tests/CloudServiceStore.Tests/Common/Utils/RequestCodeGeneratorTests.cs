using System.Text.RegularExpressions;
using CloudServiceStore.Application.Common.Utils;

namespace CloudServiceStore.Tests.Common.Utils;

public class RequestCodeGeneratorTests
{
    [Fact]
    public void Generate_ReturnsCodeMatchingPrefixDateFormat()
    {
        var result = RequestCodeGenerator.Generate("ORD");

        Assert.Matches(new Regex(@"^ORD-\d{12}-\d{2}$"), result);
    }

    [Fact]
    public void Generate_DifferentPrefix_IsReflectedInOutput()
    {
        var result = RequestCodeGenerator.Generate("CSR");

        Assert.StartsWith("CSR-", result);
    }
}
