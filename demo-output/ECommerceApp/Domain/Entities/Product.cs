using System;
using System.Collections.Generic;

namespace ECommerceApp.Domain.Entities
{
    public class Product
    {
        // Properties count: 5
        // First property: Id
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;

        // Private constructor for ORM
        private Product() { }

        public Product(string name)
        {
            Id = Guid.NewGuid();
            Name = name;
        }
    }
}