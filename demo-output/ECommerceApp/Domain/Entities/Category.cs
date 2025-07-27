using System;
using System.Collections.Generic;

namespace ECommerceApp.Domain.Entities
{
    public class Category
    {
        // Properties count: 3
        // First property: Id
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;

        // Private constructor for ORM
        private Category() { }

        public Category(string name)
        {
            Id = Guid.NewGuid();
            Name = name;
        }
    }
}