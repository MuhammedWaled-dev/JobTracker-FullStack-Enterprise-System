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
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        /// <summary>Get all tasks (Admin) or tasks assigned to the current user.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin)
            {
                var all = await _taskService.GetAllAsync();
                return Ok(all);
            }

            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetByAssignedUserIdAsync(userId);
            return Ok(tasks);
        }

        /// <summary>Get tasks assigned to the current user.</summary>
        [HttpGet("assigned")]
        public async Task<IActionResult> GetAssigned()
        {
            var userId = GetCurrentUserId();
            var tasks = await _taskService.GetByAssignedUserIdAsync(userId);
            return Ok(tasks);
        }

        /// <summary>Get all tasks belonging to a specific project.</summary>
        /// هنا السيرفر يأخذ رقم المشروع من الرابط ويضعه في المتغير 
        /// projectId لتبدأ عملية البحث.
        [HttpGet("project/{projectId:guid}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            var tasks = await _taskService.GetByProjectIdAsync(projectId);
            return Ok(tasks);
        }

        /// <summary>Get a single task by ID.</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _taskService.GetByIdAsync(id);
            if (task is null)
                return NotFound(new { message = $"Task with id '{id}' was not found." });
            return Ok(task);
        }

        /// <summary>Create a new task.</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
        {
            var created = await _taskService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>Update the status of a task.</summary>
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
        {
            await _taskService.UpdateStatusAsync(id, dto);
            return NoContent();
        }

        /// <summary>Update a task's title and description.</summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
        {
            await _taskService.UpdateAsync(id, dto);
            return NoContent();
        }

        /// <summary>Assign or un-assign a user to/from a task. Pass null userId to un-assign.</summary>
        [HttpPatch("{id:guid}/assign")]
        public async Task<IActionResult> AssignUser(Guid id, [FromBody] AssignUserDto dto)
        {
            await _taskService.AssignUserAsync(id, dto.AssignedUserId);
            return NoContent();
        }

        /// <summary>Delete a task by ID.</summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _taskService.DeleteAsync(id);
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
