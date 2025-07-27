# Extending Templates

## Overview

The Clean Architecture Template Generator is designed to be highly extensible. This guide shows you how to create custom templates, add new helper functions, and modify the generation process to suit your specific needs.

## Template Structure

### Current Template Organization

```
templates/
├── Domain/
│   ├── Entity.sbn
│   └── Interfaces/
│       └── IRepository.sbn
├── Application/
│   ├── Commands/
│   │   └── CommandHandler.sbn
│   ├── Queries/
│   │   └── QueryHandler.sbn
│   └── Dtos/
│       └── Dto.sbn
├── Infrastructure/
│   └── Persistance/
│       └── Repository.sbn
└── Presentation/
    └── Controllers/
        └── Controller.sbn
```

## Creating New Templates

### Step 1: Create Template File

Create a new `.sbn` file in the appropriate directory:

**Example**: `templates/Application/Validators/Validator.sbn`

```scriban
using FluentValidation;
using {{ project_name }}.Application.Commands.{{ entity.name }}s;

namespace {{ project_name }}.Application.Validators.{{ entity.name }}s
{
    public class {{ command.name }}CommandValidator : AbstractValidator<{{ command.name }}Command>
    {
        public {{ command.name }}CommandValidator()
        {
            {%- for prop in entity.properties | array.where "required" true | array.where "is_key" false %}
            RuleFor(x => x.{{ prop.name }})
                .NotEmpty()
                .WithMessage("{{ prop.name }} is required");
            {%- endfor %}

            {%- for prop in entity.properties | array.where "type" "string" %}
            RuleFor(x => x.{{ prop.name }})
                .MaximumLength(255)
                .WithMessage("{{ prop.name }} must not exceed 255 characters");
            {%- endfor %}

            {%- for prop in entity.properties | array.where "type" "decimal" %}
            RuleFor(x => x.{{ prop.name }})
                .GreaterThan(0)
                .WithMessage("{{ prop.name }} must be greater than zero");
            {%- endfor %}
        }
    }
}
```

### Step 2: Update ProjectGenerator

Add generation logic to `ProjectGenerator.cs`:

```csharp
private async Task GenerateApplicationLayer()
{
    Console.WriteLine("Generating application layer...");
    
    foreach (var entity in _metadata.Entities)
    {
        // Existing command generation...
        
        // Add validator generation
        foreach (var command in entity.Commands)
        {
            if (_metadata.Options.UseFluentValidation)
            {
                await GenerateFile("Application/Validators/Validator.sbn",
                    Path.Combine(_metadata.ProjectName, "Application", "Validators", $"{entity.Name}s", $"{command.Name}CommandValidator.cs"),
                    new {
                        project_name = _metadata.ProjectName,
                        entity = CreateEntityModel(entity),
                        command = CreateCommandModel(command),
                        options = _metadata.Options
                    });
            }
        }
    }
}
```

### Step 3: Update Directory Creation

Ensure the directory structure is created:

```csharp
private void CreateProjectStructure()
{
    // Existing directories...
    
    // Add validator directories
    Directory.CreateDirectory(Path.Combine(_outputPath, _metadata.ProjectName, "Application", "Validators"));
    
    foreach (var entity in _metadata.Entities)
    {
        Directory.CreateDirectory(Path.Combine(_outputPath, _metadata.ProjectName, "Application", "Validators", $"{entity.Name}s"));
    }
}
```

## Advanced Template Examples

### Value Object Template

**File**: `templates/Domain/ValueObjects/ValueObject.sbn`

```scriban
using System;
using System.Collections.Generic;
using System.Linq;

namespace {{ project_name }}.Domain.ValueObjects
{
    public class {{ value_object.name }} : IEquatable<{{ value_object.name }}>
    {
        {%- for prop in value_object.properties %}
        public {{ prop.type | map_csharp_type }} {{ prop.name }} { get; }
        {%- endfor %}

        public {{ value_object.name }}(
            {%- for prop in value_object.properties -%}
            {{ prop.type | map_csharp_type }} {{ prop.name | string_downcase_first }}{% if for.index < for.array.size %}, {% endif -%}
            {%- endfor -%})
        {
            {%- for prop in value_object.properties %}
            {{ prop.name }} = {{ prop.name | string_downcase_first }} ?? throw new ArgumentNullException(nameof({{ prop.name | string_downcase_first }}));
            {%- endfor %}
        }

        public bool Equals({{ value_object.name }} other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            
            return {%- for prop in value_object.properties -%}
                {{ prop.name }}.Equals(other.{{ prop.name }}){% if for.index < for.array.size %} && {% endif -%}
            {%- endfor %};
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as {{ value_object.name }});
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(
                {%- for prop in value_object.properties -%}
                {{ prop.name }}{% if for.index < for.array.size %}, {% endif -%}
                {%- endfor -%});
        }

        public static bool operator ==({{ value_object.name }} left, {{ value_object.name }} right)
        {
            return Equals(left, right);
        }

        public static bool operator !=({{ value_object.name }} left, {{ value_object.name }} right)
        {
            return !Equals(left, right);
        }
    }
}
```

### API Response Template

**File**: `templates/Application/Common/ApiResponse.sbn`

```scriban
using System;
using System.Collections.Generic;

namespace {{ project_name }}.Application.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> SuccessResult(T data, string message = "")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }

        public static ApiResponse<T> ErrorResult(string message, List<string> errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse Success(string message = "")
        {
            return new ApiResponse
            {
                Success = true,
                Message = message
            };
        }

        public static ApiResponse Error(string message, List<string> errors = null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }
}
```

## Custom Helper Functions

### Creating Helper Functions

Add new helper functions to `TemplateHelper.cs`:

```csharp
public static class TemplateHelper
{
    // Existing functions...

    public static string ToPluralForm(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // Simple pluralization rules
        if (input.EndsWith("y"))
            return input.Substring(0, input.Length - 1) + "ies";
        if (input.EndsWith("s") || input.EndsWith("sh") || input.EndsWith("ch"))
            return input + "es";
        
        return input + "s";
    }

    public static string ToKebabCase(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return string.Concat(input.Select((x, i) => i > 0 && char.IsUpper(x) ? "-" + x : x.ToString()))
                    .ToLower();
    }

    public static string GenerateGuid()
    {
        return Guid.NewGuid().ToString();
    }

    public static string FormatDateTime(string format = "yyyy-MM-dd HH:mm:ss")
    {
        return DateTime.UtcNow.ToString(format);
    }

    public static string GetHttpVerb(string commandType)
    {
        return commandType switch
        {
            "create" => "POST",
            "update" => "PUT",
            "delete" => "DELETE",
            _ => "GET"
        };
    }
}
```

### Registering Helper Functions

Update the registration in `ProjectGenerator.cs`:

```csharp
private async Task GenerateFile(string templateName, string relativeOutputPath, object model)
{
    // Existing code...

    // Register custom functions
    scriptObject.Import("map_csharp_type", new Func<string, string>(TemplateHelper.MapCSharpType));
    scriptObject.Import("string_downcase_first", new Func<string, string>(TemplateHelper.StringDowncaseFirst));
    scriptObject.Import("default_value", new Func<string, string, string>(TemplateHelper.DefaultValue));
    
    // New helper functions
    scriptObject.Import("to_plural", new Func<string, string>(TemplateHelper.ToPluralForm));
    scriptObject.Import("to_kebab_case", new Func<string, string>(TemplateHelper.ToKebabCase));
    scriptObject.Import("generate_guid", new Func<string>(TemplateHelper.GenerateGuid));
    scriptObject.Import("format_datetime", new Func<string, string>(TemplateHelper.FormatDateTime));
    scriptObject.Import("get_http_verb", new Func<string, string>(TemplateHelper.GetHttpVerb));

    // Existing code...
}
```

### Using Helper Functions in Templates

```scriban
// Pluralization
public class {{ entity.name | to_plural }}Controller : ControllerBase

// Kebab case for routes
[Route("api/{{ entity.name | to_kebab_case }}")]

// HTTP verbs
[Http{{ command.type | get_http_verb }}]

// Generated GUID
// Generated on: {{ format_datetime }}
// ID: {{ generate_guid }}
```

## Extending Metadata Schema

### Adding New Properties

Extend the model classes to support new metadata:

```csharp
public class EntityMetadata
{
    // Existing properties...
    
    [JsonProperty("valueObjects")]
    public List<ValueObjectMetadata> ValueObjects { get; set; } = new();
    
    [JsonProperty("aggregateRoot")]
    public bool IsAggregateRoot { get; set; } = false;
    
    [JsonProperty("tableName")]
    public string TableName { get; set; } = string.Empty;
}

public class ValueObjectMetadata
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonProperty("properties")]
    public List<PropertyMetadata> Properties { get; set; } = new();
}

public class PropertyMetadata
{
    // Existing properties...
    
    [JsonProperty("maxLength")]
    public int? MaxLength { get; set; }
    
    [JsonProperty("minValue")]
    public decimal? MinValue { get; set; }
    
    [JsonProperty("maxValue")]
    public decimal? MaxValue { get; set; }
    
    [JsonProperty("isUnique")]
    public bool IsUnique { get; set; } = false;
}
```

### Using Extended Metadata

Update JSON configuration:

```json
{
  "projectName": "ECommerceApp",
  "entities": [
    {
      "name": "Product",
      "isAggregateRoot": true,
      "tableName": "Products",
      "properties": [
        {
          "name": "Name",
          "type": "string",
          "required": true,
          "maxLength": 255,
          "isUnique": true
        },
        {
          "name": "Price",
          "type": "decimal",
          "required": true,
          "minValue": 0.01,
          "maxValue": 999999.99
        }
      ],
      "valueObjects": [
        {
          "name": "Money",
          "properties": [
            { "name": "Amount", "type": "decimal" },
            { "name": "Currency", "type": "string" }
          ]
        }
      ]
    }
  ]
}
```

## Template Best Practices

### 1. Template Organization

```
templates/
├── Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Services/
│   └── Interfaces/
├── Application/
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   ├── Validators/
│   ├── Behaviors/
│   └── Common/
├── Infrastructure/
│   ├── Persistence/
│   ├── Services/
│   └── Configuration/
└── Presentation/
    ├── Controllers/
    ├── Middleware/
    └── Extensions/
```

### 2. Conditional Generation

Use metadata options to control generation:

```scriban
{%- if options.useFluentValidation %}
using FluentValidation;
{%- endif %}

{%- if options.useAutoMapper %}
using AutoMapper;
{%- endif %}

{%- if entity.isAggregateRoot %}
// This is an aggregate root
{%- endif %}
```

### 3. Error Handling in Templates

```scriban
{%- if entity.properties.size > 0 %}
    {%- for prop in entity.properties %}
        {%- if prop.name and prop.type %}
        public {{ prop.type | map_csharp_type }} {{ prop.name }} { get; set; }
        {%- endif %}
    {%- endfor %}
{%- else %}
    // No properties defined for this entity
{%- endif %}
```

### 4. Template Comments

```scriban
{{# This template generates domain entities #}}
{{# Author: Your Name #}}
{{# Version: 1.0 #}}
{{# Last Modified: {{ format_datetime }} #}}

using System;
// Generated code - do not modify manually
```

## Testing Custom Templates

### 1. Create Test Metadata

```json
{
  "projectName": "TestApp",
  "entities": [
    {
      "name": "TestEntity",
      "properties": [
        { "name": "Id", "type": "Guid", "isKey": true },
        { "name": "Name", "type": "string", "required": true, "maxLength": 100 }
      ],
      "commands": [
        { "name": "CreateTestEntity", "type": "create" }
      ]
    }
  ],
  "options": {
    "useFluentValidation": true
  }
}
```

### 2. Test Generation

```bash
dotnet run --project CleanArchitectureTemplateGenerator.CLI -- \
  --metadata test-metadata.json \
  --output ./test-output \
  --templates ./templates
```

### 3. Validate Output

Check that:
- Files are generated in correct locations
- Content matches expectations
- No syntax errors in generated code
- All placeholders are replaced

## Common Extension Scenarios

### 1. Adding Swagger Documentation

Create `templates/Presentation/Extensions/SwaggerExtensions.sbn`:

```scriban
using Microsoft.OpenApi.Models;

namespace {{ project_name }}.Presentation.Extensions
{
    public static class SwaggerExtensions
    {
        public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "{{ project_name }} API",
                    Version = "v1",
                    Description = "{{ project_name }} Web API"
                });
            });

            return services;
        }
    }
}
```

### 2. Adding Database Configurations

Create `templates/Infrastructure/Data/EntityConfigurations.sbn`:

```scriban
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using {{ project_name }}.Domain.Entities;

namespace {{ project_name }}.Infrastructure.Data.Configurations
{
    public class {{ entity.name }}Configuration : IEntityTypeConfiguration<{{ entity.name }}>
    {
        public void Configure(EntityTypeBuilder<{{ entity.name }}> builder)
        {
            builder.ToTable("{{ entity.tableName | default entity.name }}");

            {%- for prop in entity.properties %}
            {%- if prop.isKey %}
            builder.HasKey(x => x.{{ prop.name }});
            {%- endif %}
            
            {%- if prop.maxLength %}
            builder.Property(x => x.{{ prop.name }})
                .HasMaxLength({{ prop.maxLength }});
            {%- endif %}
            
            {%- if prop.required %}
            builder.Property(x => x.{{ prop.name }})
                .IsRequired();
            {%- endif %}
            {%- endfor %}
        }
    }
}
```

## Next Steps

- [Troubleshooting](./11-troubleshooting.md) - Common issues and solutions
- [Best Practices](./12-best-practices.md) - Recommended usage patterns
- [API Reference](./09-api-reference.md) - Core classes and methods
