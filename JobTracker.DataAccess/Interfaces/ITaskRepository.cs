using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JobTracker.Models.Entities;

namespace JobTracker.DataAccess.Interfaces
{
    public interface ITaskRepository
    {
        Task<IEnumerable<TaskItem>> GetAllAsync();
        Task<IEnumerable<TaskItem>> GetByProjectIdAsync(Guid projectId);
        Task<IEnumerable<TaskItem>> GetByAssignedUserIdAsync(Guid userId);
        Task<TaskItem?> GetByIdAsync(Guid id);
        Task AddAsync(TaskItem task);
        Task UpdateAsync(TaskItem task);
        Task DeleteAsync(Guid id);
    }
}
