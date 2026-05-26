using System.Threading.Tasks;
using JobTracker.Models.DTOs;

namespace JobTracker.Business.Interfaces
{
    public interface IAuthService
    {
        /// <summary>Registers a new user. Throws InvalidOperationException if email already exists.</summary>
        Task RegisterAsync(RegisterUserDto dto);

        /// <summary>
        /// Returns a signed JWT token string on success.
        /// Throws UnauthorizedAccessException if credentials are invalid.
        /// </summary>
        Task<string> LoginAsync(LoginUserDto dto);
    }
}
