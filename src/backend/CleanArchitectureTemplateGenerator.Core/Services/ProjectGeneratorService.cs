using CleanArchitectureTemplateGenerator.Core.Models;
using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Services;

/// <summary>
/// Service implementation for project generation operations
/// </summary>
public class ProjectGeneratorService : IProjectGeneratorService
{
    private readonly string _templatesPath;

    public ProjectGeneratorService()
    {
        // Default templates path - can be configured via appsettings.json
        _templatesPath = Path.Combine(Directory.GetCurrentDirectory(), "templates");
    }

    public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath)
    {
        try
        {
            // Validate metadata first
            var validationResult = await ValidateMetadataAsync(metadata);
            if (!validationResult.IsValid)
            {
                return new GenerationResult
                {
                    Success = false,
                    ErrorMessage = $"Metadata validation failed: {string.Join(", ", validationResult.Errors)}"
                };
            }

            // Ensure templates directory exists
            if (!Directory.Exists(_templatesPath))
            {
                return new GenerationResult
                {
                    Success = false,
                    ErrorMessage = $"Templates directory not found: {_templatesPath}"
                };
            }

            // Convert metadata to JSON for existing ProjectGenerator
            var metadataJson = JsonConvert.SerializeObject(metadata, Formatting.Indented);

            // Use existing ProjectGenerator
            var generator = new ProjectGenerator(_templatesPath, outputPath, metadataJson);
            await generator.GenerateAsync();

            // Get list of generated files
            var generatedFiles = GetGeneratedFiles(outputPath);

            return new GenerationResult
            {
                Success = true,
                OutputPath = outputPath,
                GeneratedFiles = generatedFiles
            };
        }
        catch (Exception ex)
        {
            return new GenerationResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<ValidationResult> ValidateMetadataAsync(ProjectMetadata metadata)
    {
        var result = new ValidationResult { IsValid = true };

        // Validate project name
        if (string.IsNullOrWhiteSpace(metadata.ProjectName))
        {
            result.Errors.Add("Project name is required");
            result.IsValid = false;
        }
        else if (!IsValidIdentifier(metadata.ProjectName))
        {
            result.Errors.Add("Project name must be a valid C# identifier");
            result.IsValid = false;
        }

        // Validate entities
        if (metadata.Entities == null || metadata.Entities.Count == 0)
        {
            result.Errors.Add("At least one entity is required");
            result.IsValid = false;
        }
        else
        {
            foreach (var entity in metadata.Entities)
            {
                await ValidateEntity(entity, result);
            }
        }

        // Validate options
        if (metadata.Options == null)
        {
            result.Warnings.Add("Generation options not specified, using defaults");
        }

        return result;
    }

    public async Task<TemplateInfo> GetTemplateInfoAsync()
    {
        var templateInfo = new TemplateInfo
        {
            Version = "1.0.0",
            LastUpdated = DateTime.UtcNow
        };

        if (Directory.Exists(_templatesPath))
        {
            var templateFiles = Directory.GetFiles(_templatesPath, "*.sbn", SearchOption.AllDirectories);
            templateInfo.AvailableTemplates = templateFiles
                .Select(f => Path.GetRelativePath(_templatesPath, f))
                .ToList();
        }

        return await Task.FromResult(templateInfo);
    }

    private async Task ValidateEntity(EntityMetadata entity, ValidationResult result)
    {
        // Validate entity name
        if (string.IsNullOrWhiteSpace(entity.Name))
        {
            result.Errors.Add("Entity name is required");
            result.IsValid = false;
        }
        else if (!IsValidIdentifier(entity.Name))
        {
            result.Errors.Add($"Entity name '{entity.Name}' must be a valid C# identifier");
            result.IsValid = false;
        }

        // Validate properties
        if (entity.Properties == null || entity.Properties.Count == 0)
        {
            result.Errors.Add($"Entity '{entity.Name}' must have at least one property");
            result.IsValid = false;
        }
        else
        {
            var hasKey = entity.Properties.Any(p => p.IsKey);
            if (!hasKey)
            {
                result.Warnings.Add($"Entity '{entity.Name}' has no key property");
            }

            foreach (var property in entity.Properties)
            {
                ValidateProperty(property, entity.Name, result);
            }
        }

        // Validate commands
        if (entity.Commands != null)
        {
            foreach (var command in entity.Commands)
            {
                ValidateCommand(command, entity.Name, result);
            }
        }

        // Validate queries
        if (entity.Queries != null)
        {
            foreach (var query in entity.Queries)
            {
                ValidateQuery(query, entity.Name, result);
            }
        }

        await Task.CompletedTask;
    }

    private void ValidateProperty(PropertyMetadata property, string entityName, ValidationResult result)
    {
        if (string.IsNullOrWhiteSpace(property.Name))
        {
            result.Errors.Add($"Property name is required in entity '{entityName}'");
            result.IsValid = false;
        }
        else if (!IsValidIdentifier(property.Name))
        {
            result.Errors.Add($"Property name '{property.Name}' in entity '{entityName}' must be a valid C# identifier");
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(property.Type))
        {
            result.Errors.Add($"Property type is required for '{property.Name}' in entity '{entityName}'");
            result.IsValid = false;
        }
    }

    private void ValidateCommand(CommandMetadata command, string entityName, ValidationResult result)
    {
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            result.Errors.Add($"Command name is required in entity '{entityName}'");
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(command.Type))
        {
            result.Errors.Add($"Command type is required for '{command.Name}' in entity '{entityName}'");
            result.IsValid = false;
        }
        else if (!IsValidCommandType(command.Type))
        {
            result.Errors.Add($"Invalid command type '{command.Type}' for '{command.Name}' in entity '{entityName}'. Valid types: create, update, delete");
            result.IsValid = false;
        }
    }

    private void ValidateQuery(QueryMetadata query, string entityName, ValidationResult result)
    {
        if (string.IsNullOrWhiteSpace(query.Name))
        {
            result.Errors.Add($"Query name is required in entity '{entityName}'");
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(query.Type))
        {
            result.Errors.Add($"Query type is required for '{query.Name}' in entity '{entityName}'");
            result.IsValid = false;
        }
        else if (!IsValidQueryType(query.Type))
        {
            result.Errors.Add($"Invalid query type '{query.Type}' for '{query.Name}' in entity '{entityName}'. Valid types: single, list");
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(query.ResultType))
        {
            result.Errors.Add($"Query result type is required for '{query.Name}' in entity '{entityName}'");
            result.IsValid = false;
        }
    }

    private static bool IsValidIdentifier(string name)
    {
        if (string.IsNullOrEmpty(name))
            return false;

        if (!char.IsLetter(name[0]) && name[0] != '_')
            return false;

        return name.All(c => char.IsLetterOrDigit(c) || c == '_');
    }

    private static bool IsValidCommandType(string type)
    {
        return type.ToLower() is "create" or "update" or "delete";
    }

    private static bool IsValidQueryType(string type)
    {
        return type.ToLower() is "single" or "list";
    }

    private static List<string> GetGeneratedFiles(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
            return new List<string>();

        return Directory.GetFiles(directoryPath, "*", SearchOption.AllDirectories)
            .Select(f => Path.GetRelativePath(directoryPath, f))
            .ToList();
    }
}
