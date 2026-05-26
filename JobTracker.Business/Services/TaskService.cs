using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JobTracker.Business.Interfaces;
using JobTracker.DataAccess.Interfaces;
using JobTracker.Models.DTOs;
using JobTracker.Models.Entities;
using JobTracker.Models.Enums;

namespace JobTracker.Business.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository    _taskRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository    _userRepository;

        public TaskService(
            ITaskRepository    taskRepository,
            IProjectRepository projectRepository,
            IUserRepository    userRepository)
        {
            _taskRepository    = taskRepository;
            _projectRepository = projectRepository;
            _userRepository    = userRepository;
        }

        public async Task<IEnumerable<TaskDto>> GetAllAsync()
        {
            var tasks = await _taskRepository.GetAllAsync();
            return tasks.Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> GetByProjectIdAsync(Guid projectId)
        {
            var tasks = await _taskRepository.GetByProjectIdAsync(projectId);
            return tasks.Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> GetByAssignedUserIdAsync(Guid userId)
        {
            var tasks = await _taskRepository.GetByAssignedUserIdAsync(userId);
            return tasks.Select(MapToDto);
        }

        public async Task<TaskDto?> GetByIdAsync(Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            return task is null ? null : MapToDto(task);
        }

        public async Task<TaskDto> CreateAsync(CreateTaskDto dto)
        {
            // Business rule: The referenced project must exist.
            var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
            if (project is null)
                throw new KeyNotFoundException($"Project with id '{dto.ProjectId}' was not found.");

            // Business rule: If a user is assigned, they must exist.
            if (dto.AssignedUserId.HasValue)
            {
                var assignee = await _userRepository.GetByIdAsync(dto.AssignedUserId.Value);
                if (assignee is null)
                    throw new KeyNotFoundException($"User with id '{dto.AssignedUserId}' was not found.");
            }

            var task = new TaskItem
            {
                Title          = dto.Title.Trim(),
                Description    = dto.Description.Trim(),
                ProjectId      = dto.ProjectId,
                AssignedUserId = dto.AssignedUserId,
                Status         = JobTracker.Models.Enums.TaskStatus.Todo,
                CreatedAt      = DateTime.UtcNow
            };

            await _taskRepository.AddAsync(task);
            return MapToDto(task);
        }

        public async Task UpdateStatusAsync(Guid taskId, UpdateTaskStatusDto dto)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task is null)
                throw new KeyNotFoundException($"Task with id '{taskId}' was not found.");

            // Business rule: enforce valid status transition order.
            // Todo -> Doing -> Done (any backward move is permitted by default,
            // but we log the change for auditability).
            task.Status = dto.Status;
            await _taskRepository.UpdateAsync(task);
        }

        public async Task AssignUserAsync(Guid taskId, Guid? userId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task is null)
                throw new KeyNotFoundException($"Task with id '{taskId}' was not found.");

            // Business rule: if a user id is provided, it must exist.
            if (userId.HasValue)
            {
                var user = await _userRepository.GetByIdAsync(userId.Value);
                if (user is null)
                    throw new KeyNotFoundException($"User with id '{userId}' was not found.");
            }

            task.AssignedUserId = userId;
            await _taskRepository.UpdateAsync(task);
        }

        public async Task DeleteAsync(Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task is null)
                throw new KeyNotFoundException($"Task with id '{id}' was not found.");

            await _taskRepository.DeleteAsync(id);
        }

        public async Task UpdateAsync(Guid taskId, UpdateTaskDto dto)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task is null)
                throw new KeyNotFoundException($"Task with id '{taskId}' was not found.");

            task.Title       = dto.Title.Trim();
            task.Description = dto.Description.Trim();
            await _taskRepository.UpdateAsync(task);
        }

        // ── Manual Mapping ───────────────────────────────────────────────────

        private static TaskDto MapToDto(TaskItem task) => new()
        {
            Id             = task.Id,
            Title          = task.Title,
            Description    = task.Description,
            ProjectId      = task.ProjectId,
            AssignedUserId = task.AssignedUserId,
            Status         = task.Status,
            CreatedAt      = task.CreatedAt
        };
    }
}
