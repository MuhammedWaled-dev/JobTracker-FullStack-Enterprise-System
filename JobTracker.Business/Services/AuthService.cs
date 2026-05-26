using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using JobTracker.Business.Interfaces;
using JobTracker.DataAccess.Interfaces;
using JobTracker.Models.DTOs;
using JobTracker.Models.Entities;
using JobTracker.Models.Enums;

namespace JobTracker.Business.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task RegisterAsync(RegisterUserDto dto)
        {
            // Check for duplicate email
            var existing = await _userRepository.GetByEmailAsync(dto.Email);
            if (existing is not null)
                throw new InvalidOperationException($"A user with the email '{dto.Email}' already exists.");
    
            var user = new User
            {
                Name         = dto.Name.Trim(),
                Email        = dto.Email.Trim().ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role         = dto.Role
            };

            await _userRepository.AddAsync(user);
        }

        public async Task<string> LoginAsync(LoginUserDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);

            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            return GenerateJwtToken(user);
        }

        // ── Private Helpers ──────────────────────────────────────────────────

        private string GenerateJwtToken(User user)
        {
            var jwtKey    = _configuration["Jwt:Key"]
                            ?? throw new InvalidOperationException("JWT Key is not configured.");
            var jwtIssuer = _configuration["Jwt:Issuer"]
                            ?? throw new InvalidOperationException("JWT Issuer is not configured.");
            var jwtAudience = _configuration["Jwt:Audience"]
                            ?? throw new InvalidOperationException("JWT Audience is not configured.");

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(JwtRegisteredClaimNames.Name, user.Name),
                new("role", user.Role.ToString()),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Role, user.Role.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer:             jwtIssuer,
                audience:           jwtAudience,
                claims:             claims,
                expires:            DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
