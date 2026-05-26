using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Business.Interfaces;
using JobTracker.Models.DTOs;

namespace JobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        /// <summary>Get all projects. Admin sees all; regular users see their own.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin)
            {
                var all = await _projectService.GetAllAsync();
                return Ok(all);
            }

            var ownerId = GetCurrentUserId();
            var projects = await _projectService.GetByOwnerIdAsync(ownerId);
            return Ok(projects);
        }

        /// <summary>Get a project by ID.</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _projectService.GetByIdAsync(id);
            if (project is null)
                return NotFound(new { message = $"Project with id '{id}' was not found." });
            return Ok(project);
        }

        /// <summary>Create a new project owned by the current user.</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var ownerId = GetCurrentUserId();
            var created = await _projectService.CreateAsync(ownerId, dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>Update a project by ID.</summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateProjectDto dto)
        {
            await _projectService.UpdateAsync(id, dto);
            return NoContent();
        }

        /// <summary>Delete a project by ID.</summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _projectService.DeleteAsync(id);
            return NoContent();
        }

        private Guid GetCurrentUserId()
        {
            var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                   ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? throw new UnauthorizedAccessException("User identity could not be determined.");
            return Guid.Parse(sub);
        }
    }
}
