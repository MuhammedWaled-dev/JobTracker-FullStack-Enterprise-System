using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JobTracker.DataAccess.Interfaces;
using JobTracker.Models.Entities;

namespace JobTracker.DataAccess.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;

        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Project>> GetAllAsync()
        {
            return await _context.Projects.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Projects.AsNoTracking()
                .Where(p => p.OwnerId == ownerId)
                .ToListAsync();
        }

        public async Task<Project?> GetByIdAsync(Guid id)
        {
            return await _context.Projects.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Project project)
        {
            project.Id = Guid.NewGuid();
            project.CreatedAt = DateTime.UtcNow;
            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Project project)
        {
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project is not null)
            {
                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
            }
        }
    }
}
