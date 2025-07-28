using CleanArchitectureTemplateGenerator.Core.Models;


namespace CleanArchitectureTemplateGenerator.Core.Services;

/// <summary>
/// Service interface for project generation operations
/// </summary>
public interface IProjectGeneratorService
{
    /// <summary>
    /// Generates a Clean Architecture project from metadata
    /// </summary>
    /// <param name="metadata">Project metadata</param>
    /// <param name="outputPath">Output directory path</param>
    /// <returns>Generation result</returns>
    Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath);

    /// <summary>
    /// Validates project metadata
    /// </summary>
    /// <param name="metadata">Project metadata to validate</param>
    /// <returns>Validation result</returns>
    Task<ValidationResult> ValidateMetadataAsync(ProjectMetadata metadata);

    /// <summary>
    /// Gets information about available templates
    /// </summary>
    /// <returns>Template information</returns>
    Task<TemplateInfo> GetTemplateInfoAsync();
}
