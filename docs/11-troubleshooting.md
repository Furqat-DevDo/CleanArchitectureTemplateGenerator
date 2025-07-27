# Troubleshooting Guide

## Common Issues and Solutions

This guide covers the most common issues you might encounter when using the Clean Architecture Template Generator and how to resolve them.

## Installation and Setup Issues

### Issue: .NET SDK Not Found

**Error Message**:
```
The command 'dotnet' is not recognized as an internal or external command
```

**Solution**:
1. Install .NET 8.0 SDK from [Microsoft's official site](https://dotnet.microsoft.com/download)
2. Restart your terminal/command prompt
3. Verify installation: `dotnet --version`

**Expected Output**: `8.0.x` or later

### Issue: Build Failures

**Error Message**:
```
error MSB4019: The imported project "..." was not found
```

**Solution**:
1. Ensure you're in the correct directory
2. Restore NuGet packages: `dotnet restore`
3. Clean and rebuild: `dotnet clean && dotnet build`

## Command Line Issues

### Issue: Required Parameter Missing

**Error Message**:
```
Option '--metadata' is required.
```

**Solution**:
Ensure all required parameters are provided:

```bash
dotnet run --project CleanArchitectureTemplateGenerator.CLI -- \
  --metadata SampleMetadata.json \
  --output ./output \
  --templates ./templates
```

**Check**:
- All three parameters are present
- File paths are correct
- No typos in parameter names

### Issue: File Not Found

**Error Message**:
```
Error: Metadata file not found: metadata.json
```

**Solution**:
1. **Check file existence**: `ls metadata.json` (Linux/Mac) or `dir metadata.json` (Windows)
2. **Use absolute paths**: `C:\full\path\to\metadata.json`
3. **Check current directory**: `pwd` (Linux/Mac) or `cd` (Windows)
4. **Verify file permissions**: Ensure the file is readable

### Issue: Directory Not Found

**Error Message**:
```
Error: Templates directory not found: ./templates
```

**Solution**:
1. **Check directory existence**: `ls -la templates/` or `dir templates\`
2. **Use absolute paths**: `/full/path/to/templates`
3. **Check directory structure**:
   ```
   templates/
   ├── Domain/
   ├── Application/
   ├── Infrastructure/
   └── Presentation/
   ```

## JSON Configuration Issues

### Issue: Invalid JSON Syntax

**Error Message**:
```
Newtonsoft.Json.JsonReaderException: Unexpected character encountered while parsing value
```

**Solution**:
1. **Validate JSON syntax** using online validators (jsonlint.com)
2. **Check for common issues**:
   - Missing commas between properties
   - Trailing commas (not allowed in JSON)
   - Unescaped quotes in strings
   - Missing closing brackets/braces

**Example of Invalid JSON**:
```json
{
  "projectName": "MyApp",
  "entities": [
    {
      "name": "Product",
      "properties": [
        { "name": "Id", "type": "Guid" },  // Trailing comma issue
      ]
    }
  ]
}
```

**Corrected JSON**:
```json
{
  "projectName": "MyApp",
  "entities": [
    {
      "name": "Product",
      "properties": [
        { "name": "Id", "type": "Guid" }
      ]
    }
  ]
}
```

### Issue: Missing Required Properties

**Error Message**:
```
ArgumentException: Invalid metadata JSON
```

**Solution**:
Ensure all required properties are present:

```json
{
  "projectName": "Required",
  "entities": [
    {
      "name": "Required",
      "properties": [
        {
          "name": "Required",
          "type": "Required"
        }
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

### Issue: Property Name Casing

**Error Message**:
```
Properties not being deserialized correctly
```

**Solution**:
Use correct casing in JSON (camelCase):

**Correct**:
```json
{
  "projectName": "MyApp",
  "isKey": true,
  "resultType": "ProductDto"
}
```

**Incorrect**:
```json
{
  "ProjectName": "MyApp",
  "IsKey": true,
  "ResultType": "ProductDto"
}
```

## Template Processing Issues

### Issue: Template Not Found

**Error Message**:
```
Warning: Template not found: Domain/Entity.sbn
```

**Solution**:
1. **Check template file exists**: `ls templates/Domain/Entity.sbn`
2. **Verify file extension**: Must be `.sbn`
3. **Check file permissions**: Ensure file is readable
4. **Verify template structure**:
   ```
   templates/
   ├── Domain/
   │   └── Entity.sbn
   ├── Application/
   │   ├── Commands/
   │   │   └── CommandHandler.sbn
   │   └── Dtos/
   │       └── Dto.sbn
   ```

### Issue: Template Syntax Errors

**Error Message**:
```
Scriban.Syntax.ScriptSyntaxErrorException: Unexpected token
```

**Solution**:
1. **Check Scriban syntax**:
   - Use `{{ }}` for variables
   - Use `{% %}` for logic
   - Use `{%- -%}` to trim whitespace

2. **Common syntax issues**:
   ```scriban
   // Incorrect
   {{ if condition }}
   
   // Correct
   {%- if condition %}
   ```

3. **Validate template syntax** in isolation

### Issue: Custom Function Not Found

**Error Message**:
```
'map_csharp_type' is not available
```

**Solution**:
1. **Check function registration** in `ProjectGenerator.cs`:
   ```csharp
   scriptObject.Import("map_csharp_type", new Func<string, string>(TemplateHelper.MapCSharpType));
   ```

2. **Verify function exists** in `TemplateHelper.cs`
3. **Check function name spelling** in template

## Generation Issues

### Issue: Empty or Malformed Output

**Symptoms**:
- Files are created but contain no content
- Generated code has syntax errors
- Missing using statements

**Solution**:
1. **Check template content**: Ensure templates have proper content
2. **Verify model data**: Add debug output to check model values
3. **Test with minimal template**:
   ```scriban
   // Test template
   Project: {{ project_name }}
   Entity: {{ entity.name }}
   ```

### Issue: Permission Denied

**Error Message**:
```
UnauthorizedAccessException: Access to the path is denied
```

**Solution**:
1. **Check directory permissions**: Ensure write access to output directory
2. **Run as administrator** (Windows) or use `sudo` (Linux/Mac) if necessary
3. **Choose different output directory**: Use a directory you have write access to
4. **Check if files are in use**: Close any files that might be open in editors

### Issue: Disk Space

**Error Message**:
```
IOException: There is not enough space on the disk
```

**Solution**:
1. **Check available disk space**: `df -h` (Linux/Mac) or check drive properties (Windows)
2. **Clean up temporary files**: Clear temp directories
3. **Choose different output location**: Use a drive with more space

## Performance Issues

### Issue: Slow Generation

**Symptoms**:
- Generation takes a very long time
- High memory usage
- System becomes unresponsive

**Solution**:
1. **Reduce entity count**: Test with fewer entities first
2. **Simplify templates**: Remove complex logic from templates
3. **Check for infinite loops**: Review template logic for loops
4. **Monitor system resources**: Use Task Manager (Windows) or Activity Monitor (Mac)

### Issue: Memory Issues

**Error Message**:
```
OutOfMemoryException: Exception of type 'System.OutOfMemoryException' was thrown
```

**Solution**:
1. **Process entities in batches**: Modify generator to process smaller batches
2. **Optimize templates**: Remove unnecessary object creation
3. **Increase available memory**: Close other applications
4. **Use 64-bit runtime**: Ensure you're using 64-bit .NET runtime

## Debugging Techniques

### 1. Enable Verbose Logging

Add debug output to `ProjectGenerator.cs`:

```csharp
Console.WriteLine($"Processing entity: {entity.Name}");
Console.WriteLine($"Properties count: {entity.Properties.Count}");
foreach (var prop in entity.Properties)
{
    Console.WriteLine($"  Property: {prop.Name} ({prop.Type})");
}
```

### 2. Test with Minimal Configuration

Create a minimal test configuration:

```json
{
  "projectName": "TestApp",
  "entities": [
    {
      "name": "TestEntity",
      "properties": [
        { "name": "Id", "type": "Guid", "isKey": true }
      ],
      "commands": [],
      "queries": []
    }
  ],
  "options": {
    "useFluentValidation": false,
    "useAutoMapper": false,
    "useMediatR": false,
    "database": "EntityFramework",
    "authentication": "JWT"
  }
}
```

### 3. Isolate Template Issues

Test individual templates:

```csharp
// Test single template
var template = Template.Parse("Hello {{ name }}!");
var result = template.Render(new { name = "World" });
Console.WriteLine(result); // Should output: Hello World!
```

### 4. Validate Generated Code

After generation, compile the generated project:

```bash
cd output/ProjectName
dotnet build
```

Check for compilation errors and fix templates accordingly.

## Getting Help

### 1. Check Documentation
- Review relevant documentation sections
- Check API reference for correct usage
- Look at code examples

### 2. Search Issues
- Check existing GitHub issues
- Search for similar problems
- Review closed issues for solutions

### 3. Create Minimal Reproduction
When reporting issues:
1. Create minimal JSON configuration that reproduces the issue
2. Include exact error messages
3. Specify your environment (.NET version, OS, etc.)
4. Include steps to reproduce

### 4. Environment Information
Collect this information when seeking help:

```bash
# .NET version
dotnet --version

# OS information
# Windows: systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
# Linux: lsb_release -a
# Mac: sw_vers

# Project structure
tree templates/ # or dir /s templates\ on Windows
```

## Prevention Tips

### 1. Validate Before Generation
- Always validate JSON syntax before running
- Test with small configurations first
- Keep backups of working configurations

### 2. Version Control
- Keep templates and configurations in version control
- Tag working versions
- Document changes

### 3. Regular Testing
- Test generation after template changes
- Compile generated code to catch issues early
- Use automated testing for custom templates

### 4. Environment Consistency
- Use consistent .NET versions across team
- Document required dependencies
- Use containerization for consistent environments

## Next Steps

- [Best Practices](./12-best-practices.md) - Recommended usage patterns
- [API Reference](./09-api-reference.md) - Core classes and methods
- [Extending Templates](./10-extending-templates.md) - Create custom templates
