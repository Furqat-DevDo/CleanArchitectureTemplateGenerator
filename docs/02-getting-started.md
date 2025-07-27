# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 8.0 SDK** or later
- **Git** (for cloning the repository)
- **Visual Studio 2022** or **VS Code** (recommended for development)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CleanArchitectureTemplateGenerator
```

### 2. Build the Solution

```bash
dotnet build
```

### 3. Verify Installation

```bash
dotnet run --project CleanArchitectureTemplateGenerator.CLI -- --help
```

You should see the help output with available options.

## Basic Usage

### Command Syntax

```bash
dotnet run --project CleanArchitectureTemplateGenerator.CLI -- \
  --metadata <path-to-json-file> \
  --output <output-directory> \
  --templates <templates-directory>
```

### Parameters

| Parameter | Alias | Required | Description |
|-----------|-------|----------|-------------|
| `--metadata` | `-m` | ✅ | Path to the JSON metadata configuration file |
| `--output` | `-o` | ✅ | Directory where the generated project will be created |
| `--templates` | `-t` | ✅ | Directory containing the Scriban template files |

### Quick Start Example

Generate a sample e-commerce project:

```bash
dotnet run --project CleanArchitectureTemplateGenerator.CLI -- \
  --metadata SampleMetadata.json \
  --output ./my-ecommerce-app \
  --templates ./templates
```

## Sample Configuration

The included `SampleMetadata.json` demonstrates a typical configuration:

```json
{
  "projectName": "ECommerceApp",
  "entities": [
    {
      "name": "Product",
      "properties": [
        { "name": "Id", "type": "Guid", "isKey": true },
        { "name": "Name", "type": "string", "required": true },
        { "name": "Price", "type": "decimal", "required": true },
        { "name": "Description", "type": "string" },
        { "name": "CategoryId", "type": "Guid" }
      ],
      "commands": [
        { "name": "CreateProduct", "type": "create" },
        { "name": "UpdateProduct", "type": "update" },
        { "name": "DeleteProduct", "type": "delete" }
      ],
      "queries": [
        { "name": "GetProducts", "type": "list", "resultType": "List<ProductDto>" },
        { "name": "GetProductById", "type": "single", "resultType": "ProductDto" }
      ]
    }
  ],
  "options": {
    "useFluentValidation": true,
    "useAutoMapper": true,
    "useMediatR": true,
    "database": "EntityFramework",
    "authentication": "JWT"
  }
}
```

## Generated Project Structure

After running the generator, you'll get a complete Clean Architecture solution:

```
ECommerceApp/
├── ECommerceApp.sln
└── ECommerceApp/
    ├── Domain/
    │   ├── Entities/
    │   │   ├── Product.cs
    │   │   └── Category.cs
    │   └── Interfaces/
    │       ├── IProductRepository.cs
    │       └── ICategoryRepository.cs
    ├── Application/
    │   ├── Commands/
    │   │   └── Products/
    │   │       ├── CreateProductCommand.cs
    │   │       ├── UpdateProductCommand.cs
    │   │       └── DeleteProductCommand.cs
    │   ├── Queries/
    │   │   └── Products/
    │   │       ├── GetProductsQuery.cs
    │   │       └── GetProductByIdQuery.cs
    │   └── DTOs/
    │       ├── ProductDto.cs
    │       └── CategoryDto.cs
    ├── Infrastructure/
    │   └── Persistence/
    │       ├── ProductRepository.cs
    │       └── CategoryRepository.cs
    └── Presentation/
        └── Controllers/
            ├── ProductsController.cs
            └── CategorysController.cs
```

## What Gets Generated

### Domain Layer
- **Entities**: Rich domain models with encapsulated business logic
- **Repository Interfaces**: Contracts for data access

### Application Layer
- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (Get, List)
- **DTOs**: Data transfer objects for API contracts
- **Handlers**: MediatR handlers for commands and queries

### Infrastructure Layer
- **Repository Implementations**: Data access implementations
- **Database Context**: Entity Framework configurations

### Presentation Layer
- **API Controllers**: RESTful endpoints
- **Middleware**: Cross-cutting concerns

## Next Steps

1. **Explore the generated code** to understand the Clean Architecture structure
2. **Customize the JSON metadata** to match your domain requirements
3. **Modify templates** to suit your coding standards
4. **Add business logic** to the generated entities and handlers

## Common First Steps After Generation

1. **Add NuGet packages** for Entity Framework, MediatR, etc.
2. **Configure dependency injection** in Program.cs
3. **Set up database connection** strings
4. **Implement actual business logic** in entities and handlers
5. **Add validation rules** using FluentValidation
6. **Write unit tests** for your domain logic

## Troubleshooting

If you encounter issues:

1. **Check .NET version**: Ensure you have .NET 8.0 or later
2. **Verify file paths**: Make sure all paths in the command are correct
3. **Check JSON syntax**: Validate your metadata JSON file
4. **Review logs**: Check console output for error messages

For more detailed troubleshooting, see [Troubleshooting Guide](./11-troubleshooting.md).

## What's Next?

- [Architecture Deep Dive](./03-architecture.md) - Understand the technical details
- [Configuration Guide](./04-configuration.md) - Learn about JSON metadata options
- [Template System](./05-template-system.md) - Explore the templating engine
