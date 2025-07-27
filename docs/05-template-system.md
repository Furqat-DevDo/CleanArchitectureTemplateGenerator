# Template System

## Overview

The Clean Architecture Template Generator uses the **Scriban** templating engine to generate C# code. Scriban is a fast, powerful, and safe templating engine for .NET with a syntax similar to Liquid templates.

## Template Structure

Templates are organized by architectural layer:

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

## Scriban Syntax Basics

### Variables
```scriban
{{ variable_name }}
{{ object.property }}
{{ array[0] }}
```

### Loops
```scriban
{%- for item in collection %}
  {{ item.name }}
{%- endfor %}
```

### Conditionals
```scriban
{%- if condition %}
  // Code when true
{%- else %}
  // Code when false
{%- endif %}
```

### Filters
```scriban
{{ text | upcase }}
{{ number | format "C" }}
{{ custom_function parameter }}
```

## Available Data Models

When processing templates, the following data is available:

### Root Context
- `project_name`: The name of the project
- `entity`: Current entity being processed
- `command`: Current command being processed (in command templates)
- `query`: Current query being processed (in query templates)
- `options`: Generation options

### Entity Model
```scriban
{
  "name": "Product",
  "properties": [
    {
      "name": "Id",
      "type": "Guid",
      "is_key": true,
      "required": false
    }
  ]
}
```

### Property Model
```scriban
{
  "name": "Name",
  "type": "string",
  "is_key": false,
  "required": true
}
```

## Custom Helper Functions

The generator provides custom helper functions for common operations:

### map_csharp_type
Maps type names to appropriate C# types:

```scriban
{{ property.type | map_csharp_type }}
```

**Examples:**
- `"string"` → `"string"`
- `"int"` → `"int"`
- `"Guid"` → `"Guid"`

### string_downcase_first
Converts the first character to lowercase:

```scriban
{{ property.name | string_downcase_first }}
```

**Examples:**
- `"ProductName"` → `"productName"`
- `"Id"` → `"id"`

### default_value
Provides a default value if the input is empty:

```scriban
{{ command.result_type | default_value "Unit" }}
```

## Template Examples

### Domain Entity Template

```scriban
using System;
using System.Collections.Generic;

namespace {{ project_name }}.Domain.Entities
{
    public class {{ entity.name }}
    {
        {%- for prop in entity.properties %}
        public {{ prop.type | map_csharp_type }} {{ prop.name }} { get; private set; }
        {%- endfor %}

        // Private constructor for ORM
        private {{ entity.name }}() { }

        public {{ entity.name }}(
            {%- assign required_props = entity.properties | array.where "required" true | array.where "is_key" false -%}
            {%- for prop in required_props -%}
            {{ prop.type | map_csharp_type }} {{ prop.name | string_downcase_first }}{% if for.index < for.array.size %}, {% endif -%}
            {%- endfor -%})
        {
            {%- for prop in required_props %}
            {{ prop.name }} = {{ prop.name | string_downcase_first }};
            {%- endfor %}
        }

        {%- for prop in entity.properties | array.where "required" false | array.where "is_key" false %}
        public void Update{{ prop.name }}({{ prop.type | map_csharp_type }} {{ prop.name | string_downcase_first }})
        {
            {{ prop.name }} = {{ prop.name | string_downcase_first }};
        }
        {%- endfor %}
    }
}
```

### DTO Template

```scriban
using System;

namespace {{ project_name }}.Application.DTOs
{
    public class {{ entity.name }}Dto
    {
        {%- for prop in entity.properties %}
        public {{ prop.type | map_csharp_type }} {{ prop.name }} { get; set; }
        {%- endfor %}
    }
}
```

### Command Handler Template

```scriban
using MediatR;
using {{ project_name }}.Application.Interfaces;
using {{ project_name }}.Domain.Entities;

namespace {{ project_name }}.Application.Commands.{{ entity.name }}s
{
    public class {{ command.name }}Command : IRequest<{{ command.result_type | default_value "Unit" }}>
    {
        {%- for prop in entity.properties | array.where "is_key" false %}
        public {{ prop.type | map_csharp_type }} {{ prop.name }} { get; set; }
        {%- endfor %}
    }

    public class {{ command.name }}CommandHandler : IRequestHandler<{{ command.name }}Command, {{ command.result_type | default_value "Unit" }}>
    {
        private readonly I{{ entity.name }}Repository _repository;

        public {{ command.name }}CommandHandler(I{{ entity.name }}Repository repository)
        {
            _repository = repository;
        }

        public async Task<{{ command.result_type | default_value "Unit" }}> Handle({{ command.name }}Command request, CancellationToken cancellationToken)
        {
            {%- if command.type == "create" %}
            var entity = new {{ entity.name }}(
                {%- assign required_props = entity.properties | array.where "required" true | array.where "is_key" false -%}
                {%- for prop in required_props -%}
                request.{{ prop.name }}{% if for.index < for.array.size %}, {% endif -%}
                {%- endfor -%});

            await _repository.AddAsync(entity);
            {%- elif command.type == "update" %}
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null) throw new NotFoundException("{{ entity.name }} not found");

            {%- for prop in entity.properties | array.where "required" false | array.where "is_key" false %}
            entity.Update{{ prop.name }}(request.{{ prop.name }});
            {%- endfor %}
            
            await _repository.UpdateAsync(entity);
            {%- elif command.type == "delete" %}
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null) throw new NotFoundException("{{ entity.name }} not found");

            await _repository.DeleteAsync(entity);
            {%- endif %}

            return {{ command.result_type | default_value "Unit" }}.Value;
        }
    }
}
```

## Advanced Template Techniques

### Filtering Arrays
```scriban
{%- assign key_props = entity.properties | array.where "is_key" true %}
{%- assign required_props = entity.properties | array.where "required" true %}
{%- assign optional_props = entity.properties | array.where "required" false %}
```

### Conditional Generation
```scriban
{%- if options.useFluentValidation %}
using FluentValidation;

public class {{ command.name }}CommandValidator : AbstractValidator<{{ command.name }}Command>
{
    public {{ command.name }}CommandValidator()
    {
        {%- for prop in entity.properties | array.where "required" true %}
        RuleFor(x => x.{{ prop.name }}).NotEmpty();
        {%- endfor %}
    }
}
{%- endif %}
```

### Loop Control
```scriban
{%- for prop in entity.properties -%}
{{ prop.name }}{% if for.index < for.array.size %}, {% endif -%}
{%- endfor %}
```

## Template Best Practices

### 1. Consistent Formatting
- Use proper indentation
- Include appropriate using statements
- Follow C# naming conventions

### 2. Error Handling
- Check for null values
- Provide meaningful error messages
- Handle edge cases

### 3. Maintainability
- Keep templates focused and single-purpose
- Use descriptive variable names
- Comment complex logic

### 4. Performance
- Minimize complex operations in loops
- Use efficient filtering
- Cache computed values

## Debugging Templates

### Common Issues
1. **Null reference errors**: Check if properties exist before accessing
2. **Type mismatches**: Ensure proper type mapping
3. **Syntax errors**: Validate Scriban syntax

### Debugging Techniques
1. **Add debug output**: Use `{{ variable | json }}` to inspect values
2. **Simplify templates**: Start with basic templates and add complexity
3. **Check logs**: Review console output for error messages

## Extending Templates

### Adding New Templates
1. Create new `.sbn` file in appropriate directory
2. Update `ProjectGenerator.cs` to process the new template
3. Test with sample metadata

### Custom Helper Functions
1. Add function to `TemplateHelper.cs`
2. Register in `ProjectGenerator.cs`
3. Use in templates with appropriate syntax

## Next Steps

- [Package Dependencies](./06-package-dependencies.md) - Learn about required packages
- [Generated Structure](./07-generated-structure.md) - See the output structure
- [Extending Templates](./10-extending-templates.md) - Create custom templates
