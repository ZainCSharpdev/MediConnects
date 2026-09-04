using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyApi.DTO;
using PharmacyApi.Services.User;
//using PharmacyApi.Services.User;

namespace PharmacyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(AuthService _authService) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var user = await _authService.LoginAsync(login);
            if (user == null)
                return Unauthorized("Invalid email or password");

            return Ok(user);
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn([FromBody] RegisterDto dto)
        {
            var user = await _authService.RegisterAsync(dto);
            return Ok(user);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] PasswordDto dto)
        {
            var success = await _authService.ChangePasswordAsync(dto);
            if (!success)
                return BadRequest("Invalid credentials or user not found");

            return Ok("Password changed successfully");
        }
    }
}

