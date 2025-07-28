using System.ComponentModel.DataAnnotations;

namespace CleanArchitectureTemplateGenerator.Core.Models;

/// <summary>
/// Request model for project generation
/// </summary>
public class GenerateProjectRequest
{
    [Required]
    public ProjectMetadata Metadata { get; set; } = new();
}

/// <summary>
/// Result of project generation
/// </summary>
public class GenerationResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string OutputPath { get; set; } = string.Empty;
    public List<string> GeneratedFiles { get; set; } = new();
    public string JobId { get; set; } = string.Empty;
    public int TotalSteps { get; set; }
    public int CompletedSteps { get; set; }
    public string CurrentStep { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}

/// <summary>
/// Progress update for project generation
/// </summary>
public class GenerationProgress
{
    public string JobId { get; set; } = string.Empty;
    public int TotalSteps { get; set; }
    public int CompletedSteps { get; set; }
    public string CurrentStep { get; set; } = string.Empty;
    public double PercentageComplete => TotalSteps > 0 ? (double)CompletedSteps / TotalSteps * 100 : 0;
    public bool IsCompleted { get; set; }
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Generation job status
/// </summary>
public class GenerationJobStatus
{
    public string JobId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "pending", "running", "completed", "failed"
    public GenerationProgress? Progress { get; set; }
    public string? DownloadUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Result of metadata validation
/// </summary>
public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Template information
/// </summary>
public class TemplateInfo
{
    public List<string> AvailableTemplates { get; set; } = new();
    public string Version { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
}
