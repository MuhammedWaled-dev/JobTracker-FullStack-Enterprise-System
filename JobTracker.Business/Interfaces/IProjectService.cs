using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JobTracker.Models.DTOs;

namespace JobTracker.Business.Interfaces
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllAsync();
        Task<IEnumerable<ProjectDto>> GetByOwnerIdAsync(Guid ownerId);
        Task<ProjectDto?> GetByIdAsync(Guid id);

        /// <summary>Creates a new project for the given owner. Returns the newly created ProjectDto.</summary>
        Task<ProjectDto> CreateAsync(Guid ownerId, CreateProjectDto dto);

        /// <summary>Updates a project. Throws KeyNotFoundException if not found.</summary>
        Task UpdateAsync(Guid id, CreateProjectDto dto);

        /// <summary>Deletes a project. Throws KeyNotFoundException if not found.</summary>
        Task DeleteAsync(Guid id);
    }
}
