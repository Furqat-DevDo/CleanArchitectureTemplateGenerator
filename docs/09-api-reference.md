# API Reference

## Overview

This document provides detailed reference information for the core classes and methods in the Clean Architecture Template Generator.

## Core Namespace: CleanArchitectureTemplateGenerator.Core

### ProjectGenerator Class

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Services`

**Purpose**: Main orchestrator for the code generation process.

#### Constructor

```csharp
public ProjectGenerator(string templatesPath, string outputPath, string metadataJson)
```

**Parameters**:
- `templatesPath` (string): Path to the directory containing Scriban templates
- `outputPath` (string): Directory where the generated project will be created
- `metadataJson` (string): JSON string containing project metadata

**Throws**:
- `ArgumentException`: When metadata JSON is invalid or cannot be deserialized

#### Methods

##### GenerateAsync()

```csharp
public async Task GenerateAsync()
```

**Purpose**: Executes the complete project generation process.

**Process**:
1. Creates project directory structure
2. Generates domain entities and interfaces
3. Generates application layer (commands, queries, DTOs)
4. Generates infrastructure layer (repositories)
5. Generates presentation layer (controllers)
6. Creates solution file

**Throws**:
- `DirectoryNotFoundException`: When template directory doesn't exist
- `IOException`: When file operations fail
- `TemplateException`: When template processing fails

##### GenerateFile()

```csharp
private async Task GenerateFile(string templateName, string relativeOutputPath, object model)
```

**Purpose**: Processes a single template file and generates output.

**Parameters**:
- `templateName` (string): Name of the template file relative to templates directory
- `relativeOutputPath` (string): Output path relative to project root
- `model` (object): Data model to pass to the template

### TemplateHelper Class

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Services`

**Purpose**: Provides utility functions for template processing.

#### Methods

##### MapCSharpType()

```csharp
public static string MapCSharpType(string typeName)
```

**Purpose**: Maps type names to appropriate C# types.

**Parameters**:
- `typeName` (string): Input type name

**Returns**: Mapped C# type name

**Mapping Table**:
| Input | Output |
|-------|--------|
| "string" | "string" |
| "int" | "int" |
| "Guid" | "Guid" |
| "decimal" | "decimal" |
| "DateTime" | "DateTime" |
| "bool" | "bool" |
| "double" | "double" |
| "float" | "float" |
| Other | Input value unchanged |

##### StringDowncaseFirst()

```csharp
public static string StringDowncaseFirst(string input)
```

**Purpose**: Converts the first character of a string to lowercase.

**Parameters**:
- `input` (string): Input string

**Returns**: String with first character in lowercase

**Examples**:
- "ProductName" → "productName"
- "Id" → "id"
- "" → ""
- null → null

##### DefaultValue()

```csharp
public static string DefaultValue(string input, string defaultValue)
```

**Purpose**: Returns a default value if the input is null or empty.

**Parameters**:
- `input` (string): Input value to check
- `defaultValue` (string): Default value to return if input is empty

**Returns**: Input value if not empty, otherwise default value

## Model Classes

### ProjectMetadata

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Models`

**Purpose**: Root configuration object representing the entire project.

#### Properties

```csharp
[JsonProperty("projectName")]
public string ProjectName { get; set; } = string.Empty;

[JsonProperty("entities")]
public List<EntityMetadata> Entities { get; set; } = new();

[JsonProperty("options")]
public GenerationOptions Options { get; set; } = new();
```

### EntityMetadata

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Models`

**Purpose**: Represents a domain entity with its properties and operations.

#### Properties

```csharp
[JsonProperty("name")]
public string Name { get; set; } = string.Empty;

[JsonProperty("properties")]
public List<PropertyMetadata> Properties { get; set; } = new();

[JsonProperty("commands")]
public List<CommandMetadata> Commands { get; set; } = new();

[JsonProperty("queries")]
public List<QueryMetadata> Queries { get; set; } = new();
```

### PropertyMetadata

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Models`

**Purpose**: Represents a property of a domain entity.

#### Properties

```csharp
[JsonProperty("name")]
public string Name { get; set; } = string.Empty;

[JsonProperty("type")]
public string Type { get; set; } = string.Empty;

[JsonProperty("isKey")]
public bool IsKey { get; set; }

[JsonProperty("required")]
public bool Required { get; set; }
```

### CommandMetadata

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Models`

**Purpose**: Represents a write operation (command) for an entity.

#### Properties

```csharp
[JsonProperty("name")]
public string Name { get; set; } = string.Empty;

[JsonProperty("type")]
public string Type { get; set; } = string.Empty; // create, update, delete

[JsonProperty("resultType")]
public string ResultType { get; set; } = "Unit";
```

#### Valid Command Types

- `"create"`: Creates a new entity instance
- `"update"`: Updates an existing entity
- `"delete"`: Removes an entity

### QueryMetadata

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Models`

**Purpose**: Represents a read operation (query) for an entity.

#### Properties

```csharp
[JsonProperty("name")]
public string Name { get; set; } = string.Empty;

[JsonProperty("type")]
public string Type { get; set; } = string.Empty; // list, single

[JsonProperty("resultType")]
public string ResultType { get; set; } = string.Empty;
```

#### Valid Query Types

- `"single"`: Returns a single entity instance
- `"list"`: Returns a collection of entities

### GenerationOptions

**Namespace**: `CleanArchitectureTemplateGenerator.Core.Models`

**Purpose**: Configuration options for code generation.

#### Properties

```csharp
[JsonProperty("useFluentValidation")]
public bool UseFluentValidation { get; set; } = true;

[JsonProperty("useAutoMapper")]
public bool UseAutoMapper { get; set; } = true;

[JsonProperty("useMediatR")]
public bool UseMediatR { get; set; } = true;

[JsonProperty("database")]
public string Database { get; set; } = "EntityFramework";

[JsonProperty("authentication")]
public string Authentication { get; set; } = "JWT";
```

## CLI Namespace: CleanArchitectureTemplateGenerator.CLI

### Program Class

**Namespace**: `CleanArchitectureTemplateGenerator.CLI`

**Purpose**: Entry point for the command-line application.

#### Main Method

```csharp
static async Task<int> Main(string[] args)
```

**Purpose**: Parses command-line arguments and executes the generation process.

**Parameters**:
- `args` (string[]): Command-line arguments

**Returns**: Exit code (0 for success, non-zero for error)

**Command-Line Options**:

| Option | Alias | Required | Description |
|--------|-------|----------|-------------|
| `--metadata` | `-m` | ✅ | Path to metadata JSON file |
| `--output` | `-o` | ✅ | Output directory |
| `--templates` | `-t` | ✅ | Templates directory |

## Exception Handling

### Common Exceptions

#### ArgumentException
**When**: Invalid metadata JSON or missing required parameters
**Handling**: Validate inputs before processing

#### DirectoryNotFoundException
**When**: Template or output directory doesn't exist
**Handling**: Check directory existence before operations

#### IOException
**When**: File system operations fail (permissions, disk space, etc.)
**Handling**: Ensure proper permissions and available disk space

#### TemplateException (Scriban)
**When**: Template syntax errors or processing failures
**Handling**: Validate template syntax and model data

## Usage Examples

### Basic Usage

```csharp
// Create generator instance
var generator = new ProjectGenerator(
    templatesPath: "./templates",
    outputPath: "./output",
    metadataJson: jsonContent
);

// Generate project
await generator.GenerateAsync();
```

### Custom Helper Function Registration

```csharp
// In ProjectGenerator.GenerateFile method
scriptObject.Import("custom_function", new Func<string, string>(CustomHelper.Process));
```

### Template Context Setup

```csharp
var scriptObject = new ScriptObject();
scriptObject.Import(model);
scriptObject.Import("map_csharp_type", new Func<string, string>(TemplateHelper.MapCSharpType));

var context = new TemplateContext();
context.PushGlobal(scriptObject);

var result = await template.RenderAsync(context);
```

## Extension Points

### Adding Custom Helper Functions

1. **Create helper method**:
   ```csharp
   public static string CustomHelper(string input)
   {
       // Custom logic
       return processedInput;
   }
   ```

2. **Register in ProjectGenerator**:
   ```csharp
   scriptObject.Import("custom_helper", new Func<string, string>(CustomHelper));
   ```

3. **Use in templates**:
   ```scriban
   {{ property.name | custom_helper }}
   ```

### Adding New Model Properties

1. **Extend model class**:
   ```csharp
   [JsonProperty("newProperty")]
   public string NewProperty { get; set; } = string.Empty;
   ```

2. **Update JSON schema**
3. **Modify templates to use new property**

### Creating Custom Templates

1. **Create `.sbn` file** in appropriate template directory
2. **Add generation logic** in `ProjectGenerator.cs`
3. **Test with sample metadata**

## Performance Considerations

### Template Caching
- Templates are parsed once per generation
- Compiled templates improve performance

### Memory Management
- Models are created as needed
- Proper disposal of file streams
- Efficient string operations

### Async Operations
- All file I/O is asynchronous
- Proper cancellation token usage
- Non-blocking operations

## Thread Safety

### ProjectGenerator
- **Not thread-safe**: Create separate instances for concurrent operations
- **Stateful**: Maintains metadata and paths during generation

### TemplateHelper
- **Thread-safe**: All methods are static and stateless
- **Pure functions**: No side effects or shared state

## Next Steps

- [Extending Templates](./10-extending-templates.md) - Create custom templates
- [Troubleshooting](./11-troubleshooting.md) - Common issues and solutions
- [Best Practices](./12-best-practices.md) - Recommended usage patterns
