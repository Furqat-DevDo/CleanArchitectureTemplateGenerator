# Development Guide

## 🛠️ Development Environment Setup

This guide covers setting up the development environment, coding standards, and contribution guidelines for the Clean Architecture Template Generator.

## 📋 Prerequisites

### Required Software
- **.NET 8 SDK** or later
- **Node.js 18+** and npm
- **Angular CLI 18+**
- **Git** for version control
- **Visual Studio Code** or **Visual Studio 2022** (recommended)

### Recommended Extensions (VS Code)
- **C# Dev Kit** - C# language support
- **Angular Language Service** - Angular development
- **TypeScript Importer** - Auto import management
- **Prettier** - Code formatting
- **ESLint** - JavaScript/TypeScript linting
- **GitLens** - Enhanced Git capabilities

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CleanArchitectureTemplateGenerator
```

### 2. Backend Setup
```bash
cd src/backend/CleanArchitectureTemplateGenerator
dotnet restore
dotnet build
dotnet run
```

### 3. Frontend Setup
```bash
cd src/frontend/clean-architecture-generator
npm install
ng serve
```

### 4. Verify Setup
- Backend: `http://localhost:5000/swagger`
- Frontend: `http://localhost:4200`

## 📁 Project Structure

### Repository Layout
```
CleanArchitectureTemplateGenerator/
├── .github/                          # GitHub workflows and templates
├── docs/                             # Documentation
├── src/
│   ├── backend/                      # .NET Backend
│   │   ├── CleanArchitectureTemplateGenerator/
│   │   └── CleanArchitectureTemplateGenerator.Core/
│   └── frontend/                     # Angular Frontend
│       └── clean-architecture-generator/
├── templates/                        # Code generation templates
├── tests/                           # Test projects
├── .gitignore
├── README.md
└── LICENSE
```

### Development Workflow
```
feature/your-feature-name
├── Backend changes
├── Frontend changes
├── Documentation updates
├── Tests
└── Pull request
```

## 🎯 Coding Standards

### Backend (.NET)

#### Code Style
```csharp
// Use PascalCase for public members
public class ProjectGeneratorService : IProjectGeneratorService
{
    // Use camelCase for private fields with underscore prefix
    private readonly ILogger<ProjectGeneratorService> _logger;
    
    // Use async/await for I/O operations
    public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata)
    {
        // Use ConfigureAwait(false) in library code
        var result = await ProcessTemplatesAsync(metadata).ConfigureAwait(false);
        return result;
    }
    
    // Use meaningful names and XML documentation
    /// <summary>
    /// Validates the project metadata for generation
    /// </summary>
    /// <param name="metadata">The project metadata to validate</param>
    /// <returns>Validation result with errors if any</returns>
    private ValidationResult ValidateMetadata(ProjectMetadata metadata)
    {
        // Implementation
    }
}
```

#### Error Handling
```csharp
public async Task<IActionResult> GenerateProject([FromBody] GenerateProjectRequest request)
{
    try
    {
        // Validate input
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var result = await _service.GenerateProjectAsync(request.Metadata);
        return Ok(result);
    }
    catch (ValidationException ex)
    {
        _logger.LogWarning(ex, "Validation failed for project {ProjectName}", request.Metadata.ProjectName);
        return BadRequest(new ProblemDetails
        {
            Title = "Validation Error",
            Detail = ex.Message
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error generating project {ProjectName}", request.Metadata.ProjectName);
        return StatusCode(500, new ProblemDetails
        {
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred"
        });
    }
}
```

### Frontend (Angular/TypeScript)

#### Code Style
```typescript
// Use PascalCase for classes and interfaces
export interface ProjectMetadata {
  projectName: string;
  description?: string;
  entities: Entity[];
}

// Use camelCase for variables and functions
export class ProjectStateService {
  private readonly projectSubject = new BehaviorSubject<ProjectMetadata>(this.getDefaultProject());
  
  // Use readonly for public observables
  readonly project$ = this.projectSubject.asObservable();
  
  // Use meaningful method names
  updateProjectName(name: string): void {
    const currentProject = this.projectSubject.value;
    this.projectSubject.next({
      ...currentProject,
      projectName: name
    });
  }
}
```

#### Component Guidelines
```typescript
@Component({
  selector: 'app-entity-panel',
  standalone: true,
  imports: [CommonModule, MaterialModules],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Use semantic HTML -->
    <section class="entity-panel">
      <header class="panel-header">
        <h2>Entities</h2>
      </header>
      
      <main class="panel-content">
        <!-- Component content -->
      </main>
    </section>
  `,
  styles: [`
    /* Use BEM methodology */
    .entity-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .panel-content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class EntityPanelComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    // Subscribe to observables with takeUntil for cleanup
    this.projectState.project$
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        // Handle project updates
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 🧪 Testing Guidelines

### Backend Testing

#### Unit Tests
```csharp
[TestClass]
public class ProjectGeneratorServiceTests
{
    private ProjectGeneratorService _service;
    private Mock<IZipService> _mockZipService;
    private Mock<ILogger<ProjectGeneratorService>> _mockLogger;
    
    [TestInitialize]
    public void Setup()
    {
        _mockZipService = new Mock<IZipService>();
        _mockLogger = new Mock<ILogger<ProjectGeneratorService>>();
        _service = new ProjectGeneratorService(_mockZipService.Object, _mockLogger.Object);
    }
    
    [TestMethod]
    public async Task GenerateProjectAsync_ValidMetadata_ReturnsSuccessResult()
    {
        // Arrange
        var metadata = CreateValidMetadata();
        var outputPath = "C:\\Temp\\Test";
        
        // Act
        var result = await _service.GenerateProjectAsync(metadata, outputPath);
        
        // Assert
        Assert.IsTrue(result.Success);
        Assert.AreEqual(outputPath, result.OutputPath);
        Assert.IsTrue(result.GeneratedFiles.Count > 0);
    }
    
    [TestMethod]
    public async Task GenerateProjectAsync_InvalidMetadata_ReturnsFailureResult()
    {
        // Arrange
        var metadata = new ProjectMetadata(); // Invalid - no project name
        
        // Act
        var result = await _service.GenerateProjectAsync(metadata, "C:\\Temp\\Test");
        
        // Assert
        Assert.IsFalse(result.Success);
        Assert.IsNotNull(result.ErrorMessage);
    }
    
    private ProjectMetadata CreateValidMetadata()
    {
        return new ProjectMetadata
        {
            ProjectName = "TestProject",
            Namespace = "TestProject",
            Entities = new List<Entity>
            {
                new Entity
                {
                    Name = "User",
                    Properties = new List<Property>
                    {
                        new Property { Name = "Id", Type = "int", IsKey = true, IsRequired = true }
                    }
                }
            }
        };
    }
}
```

#### Integration Tests
```csharp
[TestClass]
public class ProjectGeneratorControllerIntegrationTests
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;
    
    [TestInitialize]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Override services for testing
                    services.AddScoped<IProjectGeneratorService, MockProjectGeneratorService>();
                });
            });
        
        _client = _factory.CreateClient();
    }
    
    [TestMethod]
    public async Task GenerateProject_ValidRequest_ReturnsOk()
    {
        // Arrange
        var request = new GenerateProjectRequest
        {
            Metadata = CreateValidMetadata()
        };
        
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        // Act
        var response = await _client.PostAsync("/api/ProjectGenerator/generate", content);
        
        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }
}
```

### Frontend Testing

#### Unit Tests
```typescript
describe('ProjectStateService', () => {
  let service: ProjectStateService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectStateService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should update project name', () => {
    // Arrange
    const newName = 'Updated Project';
    
    // Act
    service.updateProjectName(newName);
    
    // Assert
    service.project$.subscribe(project => {
      expect(project.projectName).toBe(newName);
    });
  });
  
  it('should add entity to project', () => {
    // Arrange
    const entity: Entity = {
      name: 'TestEntity',
      properties: []
    };
    
    // Act
    service.addEntity(entity);
    
    // Assert
    service.project$.subscribe(project => {
      expect(project.entities).toContain(entity);
    });
  });
});
```

#### Component Tests
```typescript
describe('EntityPanelComponent', () => {
  let component: EntityPanelComponent;
  let fixture: ComponentFixture<EntityPanelComponent>;
  let mockProjectState: jasmine.SpyObj<ProjectStateService>;
  
  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProjectStateService', ['addEntity', 'updateEntity']);
    spy.project$ = of(mockProject);
    
    await TestBed.configureTestingModule({
      imports: [EntityPanelComponent],
      providers: [
        { provide: ProjectStateService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(EntityPanelComponent);
    component = fixture.componentInstance;
    mockProjectState = TestBed.inject(ProjectStateService) as jasmine.SpyObj<ProjectStateService>;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should add entity when form is submitted', () => {
    // Arrange
    const entityName = 'NewEntity';
    component.entityForm.patchValue({ name: entityName });
    
    // Act
    component.onAddEntity();
    
    // Assert
    expect(mockProjectState.addEntity).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: entityName })
    );
  });
});
```

## 🔄 Git Workflow

### Branch Naming
- **Feature branches**: `feature/add-entity-validation`
- **Bug fixes**: `bugfix/fix-generation-error`
- **Documentation**: `docs/update-api-documentation`
- **Refactoring**: `refactor/improve-service-structure`

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add entity relationship validation
fix: resolve SignalR connection timeout issue
docs: update API documentation for new endpoints
refactor: extract common validation logic
test: add integration tests for project generation
```

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Ensure all tests pass
5. Create pull request with detailed description
6. Request code review
7. Address feedback and merge

## 🚀 Build and Deployment

### Local Development
```bash
# Backend
cd src/backend/CleanArchitectureTemplateGenerator
dotnet watch run

# Frontend
cd src/frontend/clean-architecture-generator
ng serve --open
```

### Production Build
```bash
# Backend
dotnet publish -c Release -o ./publish

# Frontend
ng build --configuration production
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run specific service
docker-compose up backend
docker-compose up frontend
```

## 🔧 Debugging

### Backend Debugging
```csharp
// Use structured logging
_logger.LogInformation("Starting project generation for {ProjectName} with {EntityCount} entities", 
    metadata.ProjectName, metadata.Entities.Count);

// Use debug breakpoints in development
#if DEBUG
    System.Diagnostics.Debugger.Break();
#endif

// Use conditional compilation for debug code
[Conditional("DEBUG")]
private void LogDebugInformation(ProjectMetadata metadata)
{
    // Debug-only code
}
```

### Frontend Debugging
```typescript
// Use Angular DevTools
// Install: ng add @angular/devtools

// Use console debugging
console.group('Project State Update');
console.log('Previous state:', previousState);
console.log('New state:', newState);
console.groupEnd();

// Use RxJS debugging
this.projectState.project$
  .pipe(
    tap(project => console.log('Project updated:', project)),
    takeUntil(this.destroy$)
  )
  .subscribe();
```

## 📊 Performance Guidelines

### Backend Performance
- Use `async/await` for I/O operations
- Implement proper caching strategies
- Use `ConfigureAwait(false)` in library code
- Monitor memory usage and dispose resources properly

### Frontend Performance
- Use `OnPush` change detection strategy
- Implement virtual scrolling for large lists
- Lazy load components and modules
- Optimize bundle size with tree shaking

## 🔒 Security Guidelines

### Backend Security
- Validate all inputs
- Use parameterized queries
- Implement proper error handling
- Sanitize file paths and names

### Frontend Security
- Sanitize user inputs
- Use Angular's built-in XSS protection
- Implement proper CORS configuration
- Validate data from APIs

---

For more information on specific topics, see:
- [Architecture Documentation](./architecture.md)
- [API Documentation](./api.md)
- [Deployment Guide](./deployment.md)
