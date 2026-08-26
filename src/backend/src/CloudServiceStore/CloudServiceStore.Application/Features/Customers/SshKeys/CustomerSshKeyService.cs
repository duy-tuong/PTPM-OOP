using System.Text.RegularExpressions;
using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Customers.SshKeys.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Customers.SshKeys;

// Quản lý SSH Key theo tài khoản khách hàng (Đợt 3, Phần 12) - CRUD đơn giản, không có Update (khách
// xoá key cũ + thêm key mới thay vì sửa, tránh nhầm lẫn "sửa key đang được đơn hàng cũ tham chiếu" dù
// thực tế không có tham chiếu ngược - giữ mental model đơn giản: key là bất biến, chỉ thêm/xoá).
public class CustomerSshKeyService : ICustomerSshKeyService
{
    // Chấp nhận 3 định dạng phổ biến nhất (ssh-rsa/ssh-ed25519/ecdsa-sha2-*) - prefix + khoảng trắng +
    // phần base64 (bắt buộc, không rỗng) + comment tuỳ chọn ở cuối (email/tên máy khách thường tự thêm).
    private static readonly Regex SshPublicKeyPattern = new(
        @"^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521)\s+[A-Za-z0-9+/]+=*(\s+\S+)?\s*$",
        RegexOptions.Compiled);

    private readonly IUnitOfWork _unitOfWork;

    public CustomerSshKeyService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CustomerSshKeyDto>> GetMineAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        var entities = await _unitOfWork.Repository<CustomerSshKey, int>().Query()
            .Where(k => k.CustomerId == customerId)
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<CustomerSshKeyDto> CreateAsync(Guid customerId, CreateSshKeyDto dto, CancellationToken cancellationToken = default)
    {
        var trimmedKey = dto.PublicKey.Trim();
        if (!SshPublicKeyPattern.IsMatch(trimmedKey))
        {
            throw new ValidationException("SSH Public Key không đúng định dạng (phải bắt đầu bằng ssh-rsa, ssh-ed25519 hoặc ecdsa-sha2-...).");
        }

        var entity = new CustomerSshKey
        {
            CustomerId = customerId,
            Label = dto.Label.Trim(),
            PublicKey = trimmedKey,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<CustomerSshKey, int>().AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid customerId, int keyId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<CustomerSshKey, int>();
        var entity = await repository.GetByIdAsync(keyId, cancellationToken);

        // Dùng chung 404 cho cả "không tồn tại" lẫn "không phải chủ key" - mirror cách
        // OrderRequestService.CreateRenewalAsync tránh lộ thông tin key người khác tồn tại.
        if (entity is null || entity.CustomerId != customerId)
        {
            throw new NotFoundException(nameof(CustomerSshKey), keyId);
        }

        repository.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static CustomerSshKeyDto MapToDto(CustomerSshKey entity) => new()
    {
        Id = entity.Id,
        Label = entity.Label,
        PublicKey = entity.PublicKey,
        CreatedAt = entity.CreatedAt
    };
}
