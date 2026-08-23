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

    string PayOsClientId { get; }
    string PayOsApiKey { get; }
    string PayOsChecksumKey { get; }

    string ResendApiKey { get; }
    string EmailFromAddress { get; }
    string EmailFromName { get; }
}
