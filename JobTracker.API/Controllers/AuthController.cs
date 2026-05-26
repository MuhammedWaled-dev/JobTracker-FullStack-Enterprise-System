using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Business.Interfaces;
using JobTracker.Models.DTOs;

namespace JobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>Register a new user account.</summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
        {
            await _authService.RegisterAsync(dto);
            return StatusCode(201, new { message = "User registered successfully." });
        }

        /// <summary>Login and receive a JWT token.</summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            var token = await _authService.LoginAsync(dto);
            return Ok(new { token });
        }
    }
}
