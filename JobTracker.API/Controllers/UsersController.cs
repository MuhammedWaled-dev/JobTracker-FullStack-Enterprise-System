using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Business.Interfaces;
using JobTracker.DataAccess.Interfaces;

namespace JobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        // Users management is an Admin-only concern.
        // We read directly from the repository since this is a read/delete admin panel —
        // no business transformation needed beyond what the entity already provides.
        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        /// <summary>Get all users. Admin only.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }

        /// <summary>Get a user by ID. Admin only.</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user is null)
                return NotFound(new { message = $"User with id '{id}' was not found." });
            return Ok(user);
        }

        /// <summary>Delete a user by ID. Admin only.</summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user is null)
                return NotFound(new { message = $"User with id '{id}' was not found." });

            await _userRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
