using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JobTracker.Business.Interfaces;
using JobTracker.DataAccess.Interfaces;
using JobTracker.Models.DTOs;
using JobTracker.Models.Entities;

namespace JobTracker.Business.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;

        public ProjectService(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllAsync()
        {
            var projects = await _projectRepository.GetAllAsync();
            return projects.Select(MapToDto);
        }

        public async Task<IEnumerable<ProjectDto>> GetByOwnerIdAsync(Guid ownerId)
        {
            var projects = await _projectRepository.GetByOwnerIdAsync(ownerId);
            return projects.Select(MapToDto);
        }

        public async Task<ProjectDto?> GetByIdAsync(Guid id)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            return project is null ? null : MapToDto(project);
        }

        public async Task<ProjectDto> CreateAsync(Guid ownerId, CreateProjectDto dto)
        {
            var project = new Project
            {
                Name        = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                OwnerId     = ownerId,
                CreatedAt   = DateTime.UtcNow
            };

            await _projectRepository.AddAsync(project);
            return MapToDto(project);
        }

        public async Task UpdateAsync(Guid id, CreateProjectDto dto)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            if (project is null)
                throw new KeyNotFoundException($"Project with id '{id}' was not found.");

            project.Name        = dto.Name.Trim();
            project.Description = dto.Description.Trim();

            await _projectRepository.UpdateAsync(project);
        }

        public async Task DeleteAsync(Guid id)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            if (project is null)
                throw new KeyNotFoundException($"Project with id '{id}' was not found.");

            await _projectRepository.DeleteAsync(id);
        }

        // ── Manual Mapping ───────────────────────────────────────────────────

        private static ProjectDto MapToDto(Project project) => new()
        {
            Id          = project.Id,
            Name        = project.Name,
            Description = project.Description,
            OwnerId     = project.OwnerId,
            CreatedAt   = project.CreatedAt
        };
    }
}
