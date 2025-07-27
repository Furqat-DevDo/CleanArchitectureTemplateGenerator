using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ECommerceApp.Domain.Entities;

namespace ECommerceApp.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<Category> GetByIdAsync(Guid id);
        Task<IEnumerable<Category>> GetAllAsync();
        Task AddAsync(Category entity);
        Task UpdateAsync(Category entity);
        Task DeleteAsync(Category entity);
    }
}