using CleanArchitectureTemplateGenerator.Core.Models;
using CleanArchitectureTemplateGenerator.Core.Services;
using Microsoft.AspNetCore.Mvc;
using ValidationResult = CleanArchitectureTemplateGenerator.Core.Models.ValidationResult;

namespace CleanArchitectureTemplateGenerator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectGeneratorController : ControllerBase
{
    private readonly IProjectGeneratorService _projectGeneratorService;
    private readonly IZipService _zipService;
    private readonly ILogger<ProjectGeneratorController> _logger;

    public ProjectGeneratorController(
        IProjectGeneratorService projectGeneratorService,
        IZipService zipService,
        ILogger<ProjectGeneratorController> logger)
    {
        _projectGeneratorService = projectGeneratorService;
        _zipService = zipService;
        _logger = logger;
    }

    /// <summary>
    /// Generates a Clean Architecture project from metadata and returns it as a zip file
    /// </summary>
    /// <param name="request">Project generation request containing metadata</param>
    /// <returns>Zip file containing the generated project</returns>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GenerateProject([FromBody] GenerateProjectRequest request)
    {
        try
        {
            _logger.LogInformation("Starting project generation for: {ProjectName}", request.Metadata.ProjectName);

            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Generate project to temporary directory
            var tempDirectory = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(tempDirectory);

            try
            {
                // Generate the project
                var result = await _projectGeneratorService.GenerateProjectAsync(request.Metadata, tempDirectory);

                if (!result.Success)
                {
                    _logger.LogError("Project generation failed: {Error}", result.ErrorMessage);
                    return BadRequest(new ProblemDetails
                    {
                        Title = "Project Generation Failed",
                        Detail = result.ErrorMessage,
                        Status = StatusCodes.Status400BadRequest
                    });
                }

                // Create zip file
                var zipBytes = await _zipService.CreateZipFromDirectoryAsync(result.OutputPath);

                // Clean up temporary directory
                Directory.Delete(tempDirectory, true);

                // Return zip file
                var fileName = $"{request.Metadata.ProjectName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip";
                
                _logger.LogInformation("Project generation completed successfully for: {ProjectName}", request.Metadata.ProjectName);

                return File(zipBytes, "application/zip", fileName);
            }
            catch
            {
                // Clean up on error
                if (Directory.Exists(tempDirectory))
                {
                    Directory.Delete(tempDirectory, true);
                }
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating project: {ProjectName}", request.Metadata?.ProjectName ?? "Unknown");
            
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An error occurred while generating the project. Please try again.",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Validates project metadata without generating the project
    /// </summary>
    /// <param name="metadata">Project metadata to validate</param>
    /// <returns>Validation result</returns>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(ValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateMetadata([FromBody] ProjectMetadata metadata)
    {
        try
        {
            _logger.LogInformation("Validating metadata for project: {ProjectName}", metadata.ProjectName);

            var validationResult = await _projectGeneratorService.ValidateMetadataAsync(metadata);

            return Ok(validationResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating metadata for project: {ProjectName}", metadata?.ProjectName ?? "Unknown");
            
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Validation Error",
                Detail = "An error occurred while validating the metadata.",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Gets available template information
    /// </summary>
    /// <returns>Template information</returns>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(TemplateInfo), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplateInfo()
    {
        try
        {
            var templateInfo = await _projectGeneratorService.GetTemplateInfoAsync();
            return Ok(templateInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting template information");
            
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Template Info Error",
                Detail = "An error occurred while retrieving template information.",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }
}
