using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ECommerceApp.Domain.Entities;
using ECommerceApp.Domain.Interfaces;

namespace ECommerceApp.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        // Simplified repository implementation
        public async Task<Category> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task AddAsync(Category entity)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(Category entity)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteAsync(Category entity)
        {
            throw new NotImplementedException();
        }
    }
}
        {
            return await _context.Set<Category, id);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return _context.Set<Category>().AsEnumerable();
        }

        public async Task AddAsync(Category entity)
        {
            await _context.Set<Category>().AddAsync(entity);
        }

        public async Task UpdateAsync(Category entity)
        {
            _context.Set<Category>().Update(entity);
        }

        public async Task DeleteAsync(Category entity)
        {
            _context.Set<Category>().Remove(entity);
        }
    }
}