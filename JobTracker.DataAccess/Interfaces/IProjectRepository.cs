using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JobTracker.Models.Entities;

namespace JobTracker.DataAccess.Interfaces
{
    public interface IProjectRepository
    {
        Task<IEnumerable<Project>> GetAllAsync();
        Task<IEnumerable<Project>> GetByOwnerIdAsync(Guid ownerId);
        Task<Project?> GetByIdAsync(Guid id);
        Task AddAsync(Project project);
        Task UpdateAsync(Project project);
        Task DeleteAsync(Guid id);
    }
}
