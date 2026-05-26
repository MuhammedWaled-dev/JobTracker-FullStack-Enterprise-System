using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JobTracker.DataAccess.Interfaces;
using JobTracker.Models.Entities;

namespace JobTracker.DataAccess.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly AppDbContext _context;

        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskItem>> GetAllAsync()
        {
            return await _context.Tasks.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetByProjectIdAsync(Guid projectId)
        {
            return await _context.Tasks.AsNoTracking()
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetByAssignedUserIdAsync(Guid userId)
        {
            return await _context.Tasks.AsNoTracking()
                .Where(t => t.AssignedUserId == userId)
                .ToListAsync();
        }

        public async Task<TaskItem?> GetByIdAsync(Guid id)
        {
            return await _context.Tasks.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task AddAsync(TaskItem task)
        {
            task.Id = Guid.NewGuid();
            task.CreatedAt = DateTime.UtcNow;
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TaskItem task)
        {
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task is not null)
            {
                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
            }
        }
    }
}
