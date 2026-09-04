using BCrypt.Net;
using PharmacyApi.DTO;
using PharmacyApi.Repository.Dapper.Interface;
using PharmacyApi.Repository.Entity.Interface;
using PharmacyApi.Models;

namespace PharmacyApi.Services.User
{
    public class AuthService(IUserReadRepo _userRead, IUserWriteRepo _userWrite)
    {
        public async Task<SigninDto?> LoginAsync(LoginDto login)
        {
            var user = await _userRead.GetUserByEmailAsync(login.Email);
            if (user == null) return null;

            if (!BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
                return null;

            return new SigninDto
            {
                UserId = user.UserId,
                Name = user.Name ?? "",
                Role = user.Role ?? "",
                Email = user.Email ?? ""
            };
        }

        public async Task<SigninDto> RegisterAsync(RegisterDto dto)
        {
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new Models.User
            {
                Name = dto.Name,
                Role = dto.Role,
                Email = dto.Email,
                Password = hashedPassword
            };

            await _userWrite.AddUserAsync(user);

            return new SigninDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Role = user.Role,
                Email = user.Email
            };
        }

        public async Task<bool> ChangePasswordAsync(PasswordDto dto)
        {
            var user = await _userRead.GetUserByEmailAsync(dto.Email);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
                return false;

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _userWrite.UpdateUserAsync(user);

            return true;
        }
    }
}