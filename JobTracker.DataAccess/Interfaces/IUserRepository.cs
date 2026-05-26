using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JobTracker.Models.Entities;

namespace JobTracker.DataAccess.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(Guid id);
    }
}
