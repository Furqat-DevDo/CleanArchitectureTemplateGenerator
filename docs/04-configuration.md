# Configuration Guide

## JSON Metadata Structure

The Clean Architecture Template Generator uses JSON metadata files to define the structure and behavior of the generated project. This guide explains all available configuration options.

## Root Configuration

```json
{
  "projectName": "string",
  "entities": [/* EntityMetadata array */],
  "options": {/* GenerationOptions object */}
}
```

### ProjectMetadata Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `projectName` | string | ✅ | Name of the generated project and solution |
| `entities` | EntityMetadata[] | ✅ | Array of domain entities to generate |
| `options` | GenerationOptions | ✅ | Generation configuration options |

## Entity Configuration

Each entity represents a domain object with its associated operations:

```json
{
  "name": "Product",
  "properties": [
    {
      "name": "Id",
      "type": "Guid",
      "isKey": true,
      "required": false
    },
    {
      "name": "Name",
      "type": "string",
      "isKey": false,
      "required": true
    }
  ],
  "commands": [
    {
      "name": "CreateProduct",
      "type": "create",
      "resultType": "Unit"
    }
  ],
  "queries": [
    {
      "name": "GetProducts",
      "type": "list",
      "resultType": "List<ProductDto>"
    }
  ]
}
```

### EntityMetadata Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Entity name (PascalCase recommended) |
| `properties` | PropertyMetadata[] | ✅ | Entity properties/fields |
| `commands` | CommandMetadata[] | ❌ | Write operations (Create, Update, Delete) |
| `queries` | QueryMetadata[] | ❌ | Read operations (Get, List, Search) |

## Property Configuration

Properties define the structure of your domain entities:

```json
{
  "name": "Price",
  "type": "decimal",
  "isKey": false,
  "required": true
}
```

### PropertyMetadata Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Property name (PascalCase recommended) |
| `type` | string | ✅ | C# type name |
| `isKey` | boolean | ❌ | Whether this is a primary key (default: false) |
| `required` | boolean | ❌ | Whether this property is required (default: false) |

### Supported Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text data | "Product Name" |
| `int` | 32-bit integer | 42 |
| `long` | 64-bit integer | 1234567890 |
| `decimal` | Decimal number | 19.99 |
| `double` | Double precision float | 3.14159 |
| `float` | Single precision float | 2.5f |
| `bool` | Boolean value | true/false |
| `DateTime` | Date and time | 2023-12-25T10:30:00 |
| `Guid` | Unique identifier | 550e8400-e29b-41d4-a716-446655440000 |
| Custom types | Your own classes | "CategoryId" |

## Command Configuration

Commands represent write operations in the CQRS pattern:

```json
{
  "name": "UpdateProduct",
  "type": "update",
  "resultType": "Unit"
}
```

### CommandMetadata Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Command name (PascalCase recommended) |
| `type` | string | ✅ | Command type: "create", "update", "delete" |
| `resultType` | string | ❌ | Return type (default: "Unit") |

### Command Types

| Type | Description | Generated Handler |
|------|-------------|-------------------|
| `create` | Create new entity | CreateEntityCommand |
| `update` | Update existing entity | UpdateEntityCommand |
| `delete` | Delete entity | DeleteEntityCommand |

## Query Configuration

Queries represent read operations in the CQRS pattern:

```json
{
  "name": "GetProductById",
  "type": "single",
  "resultType": "ProductDto"
}
```

### QueryMetadata Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Query name (PascalCase recommended) |
| `type` | string | ✅ | Query type: "single", "list" |
| `resultType` | string | ✅ | Return type |

### Query Types

| Type | Description | Typical Return Type |
|------|-------------|-------------------|
| `single` | Get one entity | `EntityDto` |
| `list` | Get multiple entities | `List<EntityDto>` |

## Generation Options

Configure which features and patterns to include:

```json
{
  "useFluentValidation": true,
  "useAutoMapper": true,
  "useMediatR": true,
  "database": "EntityFramework",
  "authentication": "JWT"
}
```

### GenerationOptions Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `useFluentValidation` | boolean | true | Include FluentValidation for input validation |
| `useAutoMapper` | boolean | true | Include AutoMapper for object mapping |
| `useMediatR` | boolean | true | Include MediatR for CQRS pattern |
| `database` | string | "EntityFramework" | Database technology |
| `authentication` | string | "JWT" | Authentication method |

## Complete Example

Here's a comprehensive example showing all configuration options:

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
        { "name": "CategoryId", "type": "Guid", "required": true },
        { "name": "IsActive", "type": "bool", "required": true },
        { "name": "CreatedAt", "type": "DateTime", "required": true },
        { "name": "UpdatedAt", "type": "DateTime" }
      ],
      "commands": [
        { "name": "CreateProduct", "type": "create" },
        { "name": "UpdateProduct", "type": "update" },
        { "name": "DeleteProduct", "type": "delete" },
        { "name": "ActivateProduct", "type": "update" },
        { "name": "DeactivateProduct", "type": "update" }
      ],
      "queries": [
        { "name": "GetProducts", "type": "list", "resultType": "List<ProductDto>" },
        { "name": "GetProductById", "type": "single", "resultType": "ProductDto" },
        { "name": "GetActiveProducts", "type": "list", "resultType": "List<ProductDto>" },
        { "name": "GetProductsByCategory", "type": "list", "resultType": "List<ProductDto>" }
      ]
    },
    {
      "name": "Category",
      "properties": [
        { "name": "Id", "type": "Guid", "isKey": true },
        { "name": "Name", "type": "string", "required": true },
        { "name": "Description", "type": "string" },
        { "name": "ParentCategoryId", "type": "Guid" }
      ],
      "commands": [
        { "name": "CreateCategory", "type": "create" },
        { "name": "UpdateCategory", "type": "update" },
        { "name": "DeleteCategory", "type": "delete" }
      ],
      "queries": [
        { "name": "GetCategories", "type": "list", "resultType": "List<CategoryDto>" },
        { "name": "GetCategoryById", "type": "single", "resultType": "CategoryDto" },
        { "name": "GetRootCategories", "type": "list", "resultType": "List<CategoryDto>" }
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

## Best Practices

### 1. Naming Conventions
- Use **PascalCase** for entity names, properties, commands, and queries
- Use descriptive names that reflect business concepts
- Prefix commands with action verbs (Create, Update, Delete)
- Prefix queries with "Get" or "Find"

### 2. Property Design
- Always include an `Id` property with `"isKey": true`
- Mark required business properties with `"required": true`
- Use appropriate C# types for your data
- Consider nullable types for optional properties

### 3. Command and Query Design
- Keep commands focused on single operations
- Design queries based on actual use cases
- Use appropriate return types for queries
- Consider pagination for list queries

### 4. Entity Relationships
- Use foreign key properties (e.g., `CategoryId`)
- Consider navigation properties in templates
- Plan for one-to-many and many-to-many relationships

## Validation

The generator performs basic validation on the JSON metadata:

- **Required fields**: All required properties must be present
- **Type validation**: Properties must have valid C# types
- **Naming validation**: Names should follow C# naming conventions
- **Circular references**: Entities should not have circular dependencies

## Next Steps

- [Template System](./05-template-system.md) - Learn about the templating engine
- [Generated Structure](./07-generated-structure.md) - See what gets created
- [Code Examples](./08-code-examples.md) - View generated code samples
