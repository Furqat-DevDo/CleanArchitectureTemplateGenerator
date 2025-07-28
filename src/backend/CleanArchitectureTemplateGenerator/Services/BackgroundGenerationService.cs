using Microsoft.AspNetCore.SignalR;
using CleanArchitectureTemplateGenerator.Core.Models;
using CleanArchitectureTemplateGenerator.Core.Services;
using CleanArchitectureTemplateGenerator.Hubs;
using System.Collections.Concurrent;

namespace CleanArchitectureTemplateGenerator.Services;

/// <summary>
/// Background service for handling async project generation
/// </summary>
public class BackgroundGenerationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHubContext<GenerationProgressHub> _hubContext;
    private readonly ILogger<BackgroundGenerationService> _logger;
    private readonly ConcurrentQueue<GenerationJob> _jobQueue = new();
    private readonly ConcurrentDictionary<string, GenerationJobStatus> _jobStatuses = new();

    public BackgroundGenerationService(
        IServiceProvider serviceProvider,
        IHubContext<GenerationProgressHub> hubContext,
        ILogger<BackgroundGenerationService> logger)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <summary>
    /// Queue a new generation job
    /// </summary>
    public string QueueGenerationJob(ProjectMetadata metadata)
    {
        var jobId = Guid.NewGuid().ToString();
        var job = new GenerationJob
        {
            JobId = jobId,
            Metadata = metadata,
            QueuedAt = DateTime.UtcNow
        };

        _jobQueue.Enqueue(job);
        _jobStatuses[jobId] = new GenerationJobStatus
        {
            JobId = jobId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Queued generation job {JobId} for project {ProjectName}", jobId, metadata.ProjectName);
        return jobId;
    }

    /// <summary>
    /// Get job status
    /// </summary>
    public GenerationJobStatus? GetJobStatus(string jobId)
    {
        return _jobStatuses.TryGetValue(jobId, out var status) ? status : null;
    }

    /// <summary>
    /// Background processing loop
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Background Generation Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            if (_jobQueue.TryDequeue(out var job))
            {
                await ProcessGenerationJob(job, stoppingToken);
            }
            else
            {
                // Wait a bit before checking for new jobs
                await Task.Delay(1000, stoppingToken);
            }
        }

        _logger.LogInformation("Background Generation Service stopped");
    }

    /// <summary>
    /// Process a single generation job
    /// </summary>
    private async Task ProcessGenerationJob(GenerationJob job, CancellationToken cancellationToken)
    {
        var jobId = job.JobId;
        
        try
        {
            _logger.LogInformation("Starting generation job {JobId}", jobId);

            // Update job status to running
            _jobStatuses[jobId] = new GenerationJobStatus
            {
                JobId = jobId,
                Status = "running",
                CreatedAt = _jobStatuses[jobId].CreatedAt
            };

            using var scope = _serviceProvider.CreateScope();
            var projectGeneratorService = scope.ServiceProvider.GetRequiredService<IProjectGeneratorService>();
            var zipService = scope.ServiceProvider.GetRequiredService<IZipService>();

            // Create temporary directory
            var tempDirectory = Path.Combine(Path.GetTempPath(), jobId);
            Directory.CreateDirectory(tempDirectory);

            try
            {
                // Send initial progress
                await SendProgressUpdate(jobId, new GenerationProgress
                {
                    JobId = jobId,
                    TotalSteps = 5,
                    CompletedSteps = 0,
                    CurrentStep = "Initializing project generation..."
                });

                // Step 1: Validate metadata
                await SendProgressUpdate(jobId, new GenerationProgress
                {
                    JobId = jobId,
                    TotalSteps = 5,
                    CompletedSteps = 1,
                    CurrentStep = "Validating project metadata..."
                });

                // Step 2: Generate project structure
                await SendProgressUpdate(jobId, new GenerationProgress
                {
                    JobId = jobId,
                    TotalSteps = 5,
                    CompletedSteps = 2,
                    CurrentStep = "Generating project structure..."
                });

                var result = await projectGeneratorService.GenerateProjectAsync(job.Metadata, tempDirectory);

                if (!result.Success)
                {
                    throw new Exception(result.ErrorMessage);
                }

                // Step 3: Processing templates
                await SendProgressUpdate(jobId, new GenerationProgress
                {
                    JobId = jobId,
                    TotalSteps = 5,
                    CompletedSteps = 3,
                    CurrentStep = "Processing templates and generating files..."
                });

                // Step 4: Creating zip file
                await SendProgressUpdate(jobId, new GenerationProgress
                {
                    JobId = jobId,
                    TotalSteps = 5,
                    CompletedSteps = 4,
                    CurrentStep = "Creating downloadable package..."
                });

                var zipBytes = await zipService.CreateZipFromDirectoryAsync(result.OutputPath);
                var fileName = $"{job.Metadata.ProjectName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip";
                var filePath = Path.Combine(Path.GetTempPath(), "generated", fileName);
                
                // Ensure directory exists
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                await File.WriteAllBytesAsync(filePath, zipBytes, cancellationToken);

                // Step 5: Completed
                await SendProgressUpdate(jobId, new GenerationProgress
                {
                    JobId = jobId,
                    TotalSteps = 5,
                    CompletedSteps = 5,
                    CurrentStep = "Generation completed successfully!",
                    IsCompleted = true
                });

                // Update job status to completed
                _jobStatuses[jobId] = new GenerationJobStatus
                {
                    JobId = jobId,
                    Status = "completed",
                    CreatedAt = _jobStatuses[jobId].CreatedAt,
                    CompletedAt = DateTime.UtcNow,
                    DownloadUrl = $"/api/ProjectGenerator/download/{jobId}"
                };

                // Send completion notification
                await _hubContext.Clients.Group($"job_{jobId}").SendAsync("GenerationCompleted", new
                {
                    JobId = jobId,
                    Success = true,
                    DownloadUrl = $"/api/ProjectGenerator/download/{jobId}",
                    FileName = fileName
                }, cancellationToken);

                _logger.LogInformation("Generation job {JobId} completed successfully", jobId);
            }
            finally
            {
                // Clean up temporary directory
                if (Directory.Exists(tempDirectory))
                {
                    Directory.Delete(tempDirectory, true);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Generation job {JobId} failed", jobId);

            // Update job status to failed
            _jobStatuses[jobId] = new GenerationJobStatus
            {
                JobId = jobId,
                Status = "failed",
                CreatedAt = _jobStatuses[jobId].CreatedAt,
                CompletedAt = DateTime.UtcNow
            };

            // Send error notification
            await SendProgressUpdate(jobId, new GenerationProgress
            {
                JobId = jobId,
                CurrentStep = "Generation failed",
                HasError = true,
                ErrorMessage = ex.Message
            });

            await _hubContext.Clients.Group($"job_{jobId}").SendAsync("GenerationError", ex.Message, cancellationToken);
        }
    }

    /// <summary>
    /// Send progress update via SignalR
    /// </summary>
    private async Task SendProgressUpdate(string jobId, GenerationProgress progress)
    {
        await _hubContext.Clients.Group($"job_{jobId}").SendAsync("ProgressUpdate", progress);
    }
}

/// <summary>
/// Generation job model
/// </summary>
public class GenerationJob
{
    public string JobId { get; set; } = string.Empty;
    public ProjectMetadata Metadata { get; set; } = new();
    public DateTime QueuedAt { get; set; }
}
