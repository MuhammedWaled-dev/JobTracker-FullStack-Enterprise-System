using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JobTracker.Models.DTOs;

namespace JobTracker.Business.Interfaces
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetAllAsync();
        Task<IEnumerable<TaskDto>> GetByProjectIdAsync(Guid projectId);
        Task<IEnumerable<TaskDto>> GetByAssignedUserIdAsync(Guid userId);
        Task<TaskDto?> GetByIdAsync(Guid id);

        /// <summary>Creates a new task. Returns the created TaskDto.</summary>
        Task<TaskDto> CreateAsync(CreateTaskDto dto);

        /// <summary>
        /// Updates the task status.
        /// Throws KeyNotFoundException if the task does not exist.
        /// </summary>
        Task UpdateStatusAsync(Guid taskId, UpdateTaskStatusDto dto);

        /// <summary>
        /// Assigns a user to a task.
        /// Throws KeyNotFoundException if task or user id is not found.
        /// Pass null to un-assign the current user.
        /// </summary>
        Task AssignUserAsync(Guid taskId, Guid? userId);

        /// <summary>Deletes a task. Throws KeyNotFoundException if not found.</summary>
        Task DeleteAsync(Guid id);

        /// <summary>Updates a task's title and description. Throws KeyNotFoundException if not found.</summary>
        Task UpdateAsync(Guid taskId, UpdateTaskDto dto);
    }
}
