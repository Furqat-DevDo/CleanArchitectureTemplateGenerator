# User Guide

## 🚀 Getting Started

Welcome to the Clean Architecture Template Generator! This guide will walk you through using the application to design and generate Clean Architecture projects.

## 📋 Table of Contents

- [Installation](#installation)
- [Main Interface](#main-interface)
- [Project Configuration](#project-configuration)
- [Entity Management](#entity-management)
- [Relationship Management](#relationship-management)
- [Validation Rules](#validation-rules)
- [Project Generation](#project-generation)
- [Troubleshooting](#troubleshooting)

## 🔧 Installation

### Prerequisites
- **.NET 8 SDK** or later
- **Node.js 18+** and npm
- **Angular CLI 18+**
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

### Running the Application

1. **Start the Backend**
   ```bash
   cd src/backend/CleanArchitectureTemplateGenerator
   dotnet run
   ```
   Backend will be available at: `http://localhost:5000`

2. **Start the Frontend**
   ```bash
   cd src/frontend/clean-architecture-generator
   npm install
   ng serve
   ```
   Frontend will be available at: `http://localhost:4200`

3. **Open the Application**
   Navigate to `http://localhost:4200` in your browser

## 🖥️ Main Interface

The application interface is divided into several key areas:

![Main Interface](./images/main-interface.png)

1. **Header Bar** - Contains the application title and main actions
2. **Side Navigation** - Access different panels for project configuration
3. **Main Canvas** - Visual representation of your project structure
4. **Properties Panel** - Configure selected elements
5. **Status Bar** - Shows current project status and validation results

### Navigation Menu

The side navigation provides access to different aspects of your project:

- **Project Settings** - Configure basic project information
- **Entities** - Manage domain entities and their properties
- **Relationships** - Define relationships between entities
- **Validations** - Add validation rules to entities and properties
- **Commands** - Define command handlers (CQRS pattern)
- **Queries** - Define query handlers (CQRS pattern)
- **Properties** - Configure additional project properties

## 📝 Project Configuration

### Basic Information

1. Navigate to the **Project Settings** panel
2. Fill in the following fields:
   - **Project Name** (required) - The name of your solution
   - **Description** - Brief description of your project
   - **Namespace** - Root namespace for your code
   - **Target Framework** - .NET version (default: net8.0)

### Generation Options

In the same panel, you can configure generation options:

- **FluentValidation** - Include FluentValidation library
- **AutoMapper** - Include AutoMapper for object mapping
- **MediatR** - Include MediatR for CQRS implementation
- **Database Provider** - Select your database technology

## 🧩 Entity Management

Entities are the core domain objects in your Clean Architecture project.

### Creating Entities

1. Navigate to the **Entities** panel
2. Click the **Add Entity** button
3. Enter a name for your entity (use PascalCase, e.g., "Customer")
4. Optionally add a description
5. Click **Save**

### Adding Properties

1. Select an entity from the list
2. In the properties section, click **Add Property**
3. Configure the property:
   - **Name** (required) - Property name (PascalCase)
   - **Type** - Data type (string, int, DateTime, etc.)
   - **Is Key** - Check if this is a primary key
   - **Is Required** - Check if the property is required
   - **Max Length** - Maximum length (for strings)
   - **Min Length** - Minimum length (for strings)
   - **Default Value** - Default value if any
4. Click **Save Property**

### Example Entity

```json
{
  "name": "Customer",
  "properties": [
    {
      "name": "Id",
      "type": "int",
      "isKey": true,
      "isRequired": true
    },
    {
      "name": "Name",
      "type": "string",
      "isRequired": true,
      "maxLength": 100
    },
    {
      "name": "Email",
      "type": "string",
      "isRequired": true,
      "maxLength": 255
    },
    {
      "name": "DateOfBirth",
      "type": "DateTime",
      "isRequired": false
    }
  ]
}
```

## 🔄 Relationship Management

Define how entities relate to each other in your domain model.

### Creating Relationships

1. Navigate to the **Relationships** panel
2. Click **Add Relationship**
3. Configure the relationship:
   - **From Entity** - Source entity
   - **To Entity** - Target entity
   - **Type** - Relationship type:
     - **One-to-One** - Each source has exactly one target
     - **One-to-Many** - Each source has multiple targets
     - **Many-to-One** - Multiple sources have one target
     - **Many-to-Many** - Multiple sources have multiple targets
   - **Foreign Key** - Name of the foreign key property
   - **Navigation Property** - Name of the navigation property
4. Click **Save Relationship**

### Example Relationship

```json
{
  "fromEntity": "Customer",
  "toEntity": "Order",
  "type": "OneToMany",
  "foreignKey": "CustomerId",
  "navigationProperty": "Orders"
}
```

## ✅ Validation Rules

Add validation rules to ensure data integrity in your application.

### Adding Validation Rules

1. Navigate to the **Validations** panel
2. Click **Add Validation Rule**
3. Configure the rule:
   - **Entity** - Target entity
   - **Property** - Target property
   - **Rule Type** - Validation type (Required, Length, Range, etc.)
   - **Message** - Custom error message
   - **Parameters** - Rule-specific parameters
4. Click **Save Rule**

### Example Validation Rules

```json
[
  {
    "entityName": "Customer",
    "propertyName": "Email",
    "rule": "EmailAddress",
    "message": "Please enter a valid email address"
  },
  {
    "entityName": "Order",
    "propertyName": "TotalAmount",
    "rule": "Range",
    "message": "Total amount must be between 0 and 10000",
    "parameters": {
      "min": 0,
      "max": 10000
    }
  }
]
```

## 🚀 Project Generation

Once you've configured your project, you can generate the Clean Architecture solution.

### Generating the Project

1. Ensure all required fields are filled in
2. Click the **Generate Project** button in the header
3. A progress dialog will appear showing real-time generation status
4. When complete, click **Download Project** to get the ZIP file

### Generation Process

The generation process includes several steps:

1. **Validating project metadata**
2. **Generating project structure**
3. **Processing templates**
4. **Creating entity classes**
5. **Setting up repositories**
6. **Configuring validation rules**
7. **Creating API controllers**
8. **Setting up dependency injection**
9. **Creating database context**
10. **Finalizing and creating ZIP file**

### Generated Project Structure

The generated solution follows Clean Architecture principles:

```
YourProject/
├── src/
│   ├── YourProject.Domain/             # Entities, Value Objects
│   ├── YourProject.Application/        # Use Cases, Interfaces
│   ├── YourProject.Infrastructure/     # Data Access, External Services
│   └── YourProject.WebApi/             # Controllers, Startup
└── tests/
    ├── YourProject.UnitTests/
    ├── YourProject.IntegrationTests/
    └── YourProject.FunctionalTests/
```

## ❓ Troubleshooting

### Common Issues

#### Generation Fails
- Ensure all required fields are filled in
- Check that entity names are unique
- Verify that relationship entities exist
- Make sure property types are valid

#### Frontend Connection Issues
- Verify the backend is running at `http://localhost:5000`
- Check browser console for CORS errors
- Ensure SignalR connection is established

#### Download Problems
- Check browser download settings
- Verify you have sufficient disk space
- Try using a different browser

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/yourusername/CleanArchitectureTemplateGenerator/issues) for similar problems
2. Review the [API Documentation](./api.md) for endpoint details
3. Consult the [Development Guide](./development.md) for technical information
4. Open a new issue with detailed reproduction steps

---

## 🎓 Advanced Usage

For advanced usage scenarios, including customizing templates, extending the generator, and integrating with CI/CD pipelines, please refer to the [Advanced Guide](./advanced-guide.md).

---

**Happy Generating!** 🚀
