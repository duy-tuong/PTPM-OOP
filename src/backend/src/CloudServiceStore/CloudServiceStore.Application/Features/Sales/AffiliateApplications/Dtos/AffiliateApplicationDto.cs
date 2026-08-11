namespace CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;

public class AffiliateApplicationDto
{
    public int Id { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
