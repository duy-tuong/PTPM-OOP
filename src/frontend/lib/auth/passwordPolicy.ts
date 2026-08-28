// Chính sách độ mạnh mật khẩu - PHẢI khớp chính xác với PasswordPolicy.cs ở backend
// (Application/Common/Utils/PasswordPolicy.cs). Áp dụng cho MỌI luồng đặt mật khẩu MỚI (đăng ký, đổi
// mật khẩu, đặt lại mật khẩu) - KHÔNG áp dụng khi đăng nhập (LoginForm.tsx): mật khẩu tạo trước khi có
// chính sách này vẫn phải đăng nhập được bình thường, chỉ mật khẩu MỚI mới bị ép theo quy tắc.
//
// Kiểm tra ở đây chỉ là UX (phản hồi ngay khi gõ, tránh round-trip lên server) - backend luôn tự kiểm
// tra lại theo đúng Pattern này qua [RegularExpression] trên DTO, không tin tưởng tuyệt đối validate
// phía client.
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,72}$/;

export const PASSWORD_POLICY_HINT = "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

export const PASSWORD_POLICY_ERROR =
  "Mật khẩu phải có 8-72 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.";
