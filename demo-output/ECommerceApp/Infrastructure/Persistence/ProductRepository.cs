using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ECommerceApp.Domain.Entities;
using ECommerceApp.Domain.Interfaces;

namespace ECommerceApp.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        // Simplified repository implementation
        public async Task<Product> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task AddAsync(Product entity)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(Product entity)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteAsync(Product entity)
        {
            throw new NotImplementedException();
        }
    }
}
        {
            return await _context.Set<Product, id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return _context.Set<Product>().AsEnumerable();
        }

        public async Task AddAsync(Product entity)
        {
            await _context.Set<Product>().AddAsync(entity);
        }

        public async Task UpdateAsync(Product entity)
        {
            _context.Set<Product>().Update(entity);
        }

        public async Task DeleteAsync(Product entity)
        {
            _context.Set<Product>().Remove(entity);
        }
    }
}