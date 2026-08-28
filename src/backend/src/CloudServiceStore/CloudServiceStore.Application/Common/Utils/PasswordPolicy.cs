namespace CloudServiceStore.Application.Common.Utils;

// Chính sách độ mạnh mật khẩu dùng chung cho MỌI luồng đặt mật khẩu MỚI (đăng ký, đổi mật khẩu, đặt lại
// mật khẩu) - áp dụng cho cả Customer lẫn Staff vì ChangePasswordRequest (Features/Auth/Dtos) dùng chung
// giữa AuthController (Admin/Editor) và CustomerAuthController. KHÔNG áp dụng cho trường mật khẩu khi
// ĐĂNG NHẬP (LoginRequest) - tài khoản tạo trước khi có chính sách này vẫn phải đăng nhập được bình
// thường bằng mật khẩu cũ, chỉ mật khẩu MỚI mới bị ép theo quy tắc.
//
// Pattern PHẢI khớp chính xác với PASSWORD_PATTERN ở frontend (lib/auth/passwordPolicy.ts) - sửa 1 bên
// phải sửa bên kia.
public static class PasswordPolicy
{
    // 8-72 ký tự (chặn trên 72 - đúng giới hạn cứng của BCrypt: phần vượt quá 72 byte bị BCrypt âm thầm
    // bỏ qua khi băm, xem BCryptPasswordHasher.cs - không chặn sẽ khiến 2 mật khẩu khác nhau ở phần đuôi
    // hash ra cùng 1 giá trị mà người dùng không hề biết), bắt buộc có đủ chữ hoa + chữ thường + chữ số +
    // ký tự đặc biệt (không phải chữ/số/khoảng trắng).
    public const string Pattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,72}$";

    public const string ErrorMessage =
        "Mật khẩu phải có 8-72 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.";
}
