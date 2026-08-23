namespace CloudServiceStore.Application.Common.Interfaces;

public interface IAppSettings
{
    string PublicBaseUrl { get; }
    string BankName { get; }
    string BankAccountNumber { get; }
    string BankAccountHolder { get; }
    int ProvisioningDelaySeconds { get; }
    int ProvisioningCompletionDelaySeconds { get; }
    int RenewalReminderLeadDays { get; }
}
