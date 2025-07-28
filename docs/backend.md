# Backend Documentation

## 🏗️ Overview

The backend is built with **.NET 8** and **ASP.NET Core**, providing a robust, scalable API with real-time communication capabilities for the Clean Architecture Template Generator.

## 🛠️ Technology Stack

### Core Technologies
- **.NET 8** - High-performance runtime and framework
- **ASP.NET Core** - Web API framework
- **SignalR** - Real-time bidirectional communication
- **C# 12** - Modern language features
- **Minimal APIs** - Lightweight API endpoints (future)

### Key Libraries
- **Microsoft.AspNetCore.SignalR** - Real-time communication
- **Swashbuckle.AspNetCore** - API documentation
- **System.IO.Compression** - Zip file creation
- **Microsoft.Extensions.Hosting** - Background services

## 📁 Project Structure

```
src/backend/
├── CleanArchitectureTemplateGenerator/           # Web API Layer
│   ├── Controllers/                              # API Controllers
│   │   └── ProjectGeneratorController.cs         # Main API controller
│   ├── Hubs/                                     # SignalR Hubs
│   │   └── GenerationProgressHub.cs              # Real-time progress updates
│   ├── Services/                                 # Application Services
│   │   └── BackgroundGenerationService.cs        # Async job processing
│   ├── Program.cs                                # Application startup
│   └── CleanArchitectureTemplateGenerator.csproj # Project file
└── CleanArchitectureTemplateGenerator.Core/      # Core Business Logic
    ├── Models/                                   # Domain Models
    │   ├── ProjectMetadata.cs                    # Project configuration
    │   ├── Entity.cs                             # Entity definition
    │   ├── Relationship.cs                       # Entity relationships
    │   ├── ValidationRule.cs                     # Validation rules
    │   └── GenerationResult.cs                   # Generation results
    └── Services/                                 # Core Services
        ├── IProjectGeneratorService.cs           # Generation interface
        ├── ProjectGeneratorService.cs             # Generation implementation
        ├── IZipService.cs                        # Zip creation interface
        └── ZipService.cs                         # Zip creation implementation
```

## 🎯 Core Components

### Controllers

#### ProjectGeneratorController
Main API controller handling project generation requests.

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProjectGeneratorController : ControllerBase
{
    // Synchronous generation
    [HttpPost("generate")]
    public async Task<IActionResult> GenerateProject([FromBody] GenerateProjectRequest request)
    
    // Asynchronous generation
    [HttpPost("generate-async")]
    public async Task<IActionResult> GenerateProjectAsync([FromBody] GenerateProjectRequest request)
    
    // Job status checking
    [HttpGet("status/{jobId}")]
    public async Task<IActionResult> GetJobStatus(string jobId)
    
    // File download
    [HttpGet("download/{jobId}")]
    public async Task<IActionResult> DownloadProject(string jobId)
    
    // Project validation
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateProject([FromBody] GenerateProjectRequest request)
    
    // Template information
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplateInfo()
}
```

**Key Features:**
- **RESTful design** with proper HTTP verbs
- **Async/await patterns** for non-blocking operations
- **Comprehensive error handling** with proper status codes
- **Input validation** with model binding
- **Swagger documentation** with detailed examples

### SignalR Hubs

#### GenerationProgressHub
Real-time communication hub for progress updates.

```csharp
public class GenerationProgressHub : Hub
{
    // Join job-specific group
    public async Task JoinJobGroup(string jobId)
    
    // Leave job-specific group
    public async Task LeaveJobGroup(string jobId)
    
    // Send progress updates
    public async Task SendProgressUpdate(string jobId, GenerationProgress progress)
    
    // Send completion notifications
    public async Task SendCompletionNotification(string jobId, GenerationResult result)
    
    // Send error notifications
    public async Task SendErrorNotification(string jobId, string error)
}
```

**Key Features:**
- **Group-based messaging** for job-specific updates
- **Automatic connection management**
- **Error handling** and reconnection support
- **Scalable architecture** ready for Redis backplane

### Background Services

#### BackgroundGenerationService
Handles asynchronous project generation with job queuing.

```csharp
public class BackgroundGenerationService : BackgroundService
{
    private readonly ConcurrentQueue<GenerationJob> _jobQueue = new();
    private readonly ConcurrentDictionary<string, GenerationJobStatus> _jobStatuses = new();
    
    // Queue new generation job
    public string QueueGenerationJob(ProjectMetadata metadata)
    
    // Get job status
    public GenerationJobStatus? GetJobStatus(string jobId)
    
    // Background processing loop
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    
    // Process individual job
    private async Task ProcessGenerationJob(GenerationJob job, CancellationToken cancellationToken)
}
```

**Key Features:**
- **Concurrent job processing** with thread-safe collections
- **Progress tracking** with step-by-step updates
- **Error handling** and recovery mechanisms
- **Resource cleanup** for temporary files
- **Cancellation support** for graceful shutdown

## 🔧 Core Services

### Project Generator Service
Core business logic for project generation.

```csharp
public interface IProjectGeneratorService
{
    Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath);
    Task<ValidationResult> ValidateProjectAsync(ProjectMetadata metadata);
    Task<TemplateInfo> GetTemplateInfoAsync();
}

public class ProjectGeneratorService : IProjectGeneratorService
{
    // Generate complete project structure
    public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath)
    {
        // 1. Validate input
        var validation = await ValidateProjectAsync(metadata);
        if (!validation.IsValid)
            return new GenerationResult { Success = false, ErrorMessage = "Validation failed" };
        
        // 2. Create directory structure
        CreateDirectoryStructure(outputPath, metadata);
        
        // 3. Generate entities
        await GenerateEntitiesAsync(metadata.Entities, outputPath);
        
        // 4. Generate repositories
        await GenerateRepositoriesAsync(metadata.Entities, outputPath);
        
        // 5. Generate use cases
        await GenerateUseCasesAsync(metadata.Entities, outputPath);
        
        // 6. Generate controllers
        await GenerateControllersAsync(metadata.Entities, outputPath);
        
        // 7. Generate configuration files
        await GenerateConfigurationAsync(metadata, outputPath);
        
        return new GenerationResult { Success = true, OutputPath = outputPath };
    }
}
```

### Zip Service
Handles zip file creation and management.

```csharp
public interface IZipService
{
    Task<byte[]> CreateZipFromDirectoryAsync(string directoryPath);
    Task<byte[]> CreateZipFromFilesAsync(IEnumerable<string> filePaths);
    Task ExtractZipToDirectoryAsync(byte[] zipData, string extractPath);
}

public class ZipService : IZipService
{
    public async Task<byte[]> CreateZipFromDirectoryAsync(string directoryPath)
    {
        using var memoryStream = new MemoryStream();
        using var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true);
        
        var files = Directory.GetFiles(directoryPath, "*", SearchOption.AllDirectories);
        
        foreach (var file in files)
        {
            var relativePath = Path.GetRelativePath(directoryPath, file);
            var entry = archive.CreateEntry(relativePath);
            
            using var entryStream = entry.Open();
            using var fileStream = File.OpenRead(file);
            await fileStream.CopyToAsync(entryStream);
        }
        
        return memoryStream.ToArray();
    }
}
```

## 📊 Data Models

### Core Models

#### ProjectMetadata
```csharp
public class ProjectMetadata
{
    public string ProjectName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string TargetFramework { get; set; } = "net8.0";
    public List<Entity> Entities { get; set; } = new();
    public List<Relationship> Relationships { get; set; } = new();
    public List<ValidationRule> Validations { get; set; } = new();
}
```

#### Entity
```csharp
public class Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Property> Properties { get; set; } = new();
}

public class Property
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsKey { get; set; }
    public bool IsRequired { get; set; }
    public int? MaxLength { get; set; }
    public int? MinLength { get; set; }
    public string? DefaultValue { get; set; }
}
```

#### Generation Models
```csharp
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
```

## ⚙️ Configuration

### Program.cs Setup
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register services
builder.Services.AddScoped<IProjectGeneratorService, ProjectGeneratorService>();
builder.Services.AddScoped<IZipService, ZipService>();
builder.Services.AddSingleton<BackgroundGenerationService>();
builder.Services.AddHostedService<BackgroundGenerationService>(provider =>
    provider.GetRequiredService<BackgroundGenerationService>());

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthorization();
app.MapControllers();
app.MapHub<GenerationProgressHub>("/hub/generation-progress");

app.Run();
```

### Environment Configuration
```csharp
// appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "GenerationSettings": {
    "TempDirectory": "C:\\Temp\\CleanArchGeneration",
    "MaxConcurrentJobs": 5,
    "JobTimeoutMinutes": 30
  }
}

// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

## 🔒 Security Implementation

### Input Validation
```csharp
[ApiController]
public class ProjectGeneratorController : ControllerBase
{
    [HttpPost("generate")]
    public async Task<IActionResult> GenerateProject([FromBody] GenerateProjectRequest request)
    {
        // Model validation
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Business validation
        var validation = await _projectGeneratorService.ValidateProjectAsync(request.Metadata);
        if (!validation.IsValid)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = string.Join(", ", validation.Errors)
            });
        }

        // Continue with generation...
    }
}
```

### File System Security
```csharp
public class ZipService : IZipService
{
    public async Task<byte[]> CreateZipFromDirectoryAsync(string directoryPath)
    {
        // Validate directory path
        if (!Directory.Exists(directoryPath))
            throw new DirectoryNotFoundException($"Directory not found: {directoryPath}");

        // Ensure path is within allowed boundaries
        var fullPath = Path.GetFullPath(directoryPath);
        var allowedPath = Path.GetFullPath(Path.GetTempPath());

        if (!fullPath.StartsWith(allowedPath))
            throw new UnauthorizedAccessException("Access to directory is not allowed");

        // Continue with zip creation...
    }
}
```

## 📈 Performance Optimization

### Async Patterns
```csharp
public class ProjectGeneratorService : IProjectGeneratorService
{
    public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath)
    {
        // Use ConfigureAwait(false) for library code
        var validation = await ValidateProjectAsync(metadata).ConfigureAwait(false);

        // Parallel processing for independent operations
        var tasks = new List<Task>
        {
            GenerateEntitiesAsync(metadata.Entities, outputPath),
            GenerateConfigurationAsync(metadata, outputPath),
            GenerateDocumentationAsync(metadata, outputPath)
        };

        await Task.WhenAll(tasks).ConfigureAwait(false);

        return new GenerationResult { Success = true };
    }
}
```

### Memory Management
```csharp
public class BackgroundGenerationService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_jobQueue.TryDequeue(out var job))
            {
                // Process job with proper disposal
                using var scope = _serviceProvider.CreateScope();
                var generator = scope.ServiceProvider.GetRequiredService<IProjectGeneratorService>();

                try
                {
                    await ProcessGenerationJob(job, stoppingToken);
                }
                finally
                {
                    // Cleanup resources
                    CleanupTempFiles(job.JobId);
                }
            }
            else
            {
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}
```

## 🧪 Testing Strategy

### Unit Testing
```csharp
[TestClass]
public class ProjectGeneratorServiceTests
{
    private ProjectGeneratorService _service;
    private Mock<IZipService> _mockZipService;

    [TestInitialize]
    public void Setup()
    {
        _mockZipService = new Mock<IZipService>();
        _service = new ProjectGeneratorService(_mockZipService.Object);
    }

    [TestMethod]
    public async Task GenerateProjectAsync_ValidMetadata_ReturnsSuccess()
    {
        // Arrange
        var metadata = new ProjectMetadata
        {
            ProjectName = "TestProject",
            Entities = new List<Entity>
            {
                new Entity { Name = "User", Properties = new List<Property>() }
            }
        };

        // Act
        var result = await _service.GenerateProjectAsync(metadata, "C:\\Temp\\Test");

        // Assert
        Assert.IsTrue(result.Success);
        Assert.IsNotNull(result.OutputPath);
    }
}
```

### Integration Testing
```csharp
[TestClass]
public class ProjectGeneratorControllerIntegrationTests
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    [TestInitialize]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [TestMethod]
    public async Task GenerateProject_ValidRequest_ReturnsZipFile()
    {
        // Arrange
        var request = new GenerateProjectRequest
        {
            Metadata = new ProjectMetadata { ProjectName = "TestProject" }
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/ProjectGenerator/generate", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        Assert.AreEqual("application/zip", response.Content.Headers.ContentType?.MediaType);
    }
}
```

## 🚀 Deployment

### Docker Support
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CleanArchitectureTemplateGenerator.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CleanArchitectureTemplateGenerator.dll"]
```

### Production Configuration
```csharp
// Program.cs - Production setup
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
    app.UseHsts();

    // Add security headers
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        await next();
    });
}
```

## 🔍 Monitoring and Logging

### Structured Logging
```csharp
public class ProjectGeneratorService : IProjectGeneratorService
{
    private readonly ILogger<ProjectGeneratorService> _logger;

    public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath)
    {
        using var scope = _logger.BeginScope("ProjectGeneration_{ProjectName}", metadata.ProjectName);

        _logger.LogInformation("Starting project generation for {ProjectName}", metadata.ProjectName);

        try
        {
            var result = await GenerateProjectInternalAsync(metadata, outputPath);

            _logger.LogInformation("Project generation completed successfully for {ProjectName} in {Duration}ms",
                metadata.ProjectName, stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Project generation failed for {ProjectName}", metadata.ProjectName);
            throw;
        }
    }
}
```

### Health Checks
```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddCheck<BackgroundServiceHealthCheck>("background-service")
    .AddCheck<FileSystemHealthCheck>("file-system");

app.MapHealthChecks("/health");
```

---

For more detailed examples and advanced configuration, see the [Development Guide](./development.md) and [Deployment Guide](./deployment.md).
```
