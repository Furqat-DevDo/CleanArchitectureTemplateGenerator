# Contributing Guide

## 🤝 Welcome Contributors!

Thank you for your interest in contributing to the Clean Architecture Template Generator! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

### Our Pledge
We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
Examples of behavior that contributes to creating a positive environment include:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 🚀 Getting Started

### Prerequisites
- **.NET 8 SDK** or later
- **Node.js 18+** and npm
- **Angular CLI 18+**
- **Git** for version control
- **GitHub account**

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/yourusername/CleanArchitectureTemplateGenerator.git
   cd CleanArchitectureTemplateGenerator
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/CleanArchitectureTemplateGenerator.git
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd src/backend/CleanArchitectureTemplateGenerator
   dotnet restore
   
   # Frontend
   cd src/frontend/clean-architecture-generator
   npm install
   ```

4. **Verify setup**
   ```bash
   # Start backend
   cd src/backend/CleanArchitectureTemplateGenerator
   dotnet run
   
   # Start frontend (in another terminal)
   cd src/frontend/clean-architecture-generator
   ng serve
   ```

## 🛠️ How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide system information
- Add screenshots if applicable

#### ✨ Feature Requests
- Use the feature request template
- Describe the problem you're solving
- Explain your proposed solution
- Consider alternative solutions

#### 📝 Documentation
- Fix typos and grammar
- Improve clarity and examples
- Add missing documentation
- Update outdated information

#### 💻 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Refactoring

### Finding Issues to Work On

1. **Good First Issues** - Look for issues labeled `good first issue`
2. **Help Wanted** - Issues labeled `help wanted` need community support
3. **Bug Fixes** - Issues labeled `bug` that need fixing
4. **Enhancements** - Issues labeled `enhancement` for new features

## 🔄 Development Workflow

### Branch Strategy
```
main (production-ready code)
├── develop (integration branch)
├── feature/your-feature-name
├── bugfix/issue-description
├── docs/documentation-update
└── refactor/code-improvement
```

### Workflow Steps

1. **Create an issue** (if one doesn't exist)
2. **Create a branch** from `develop`
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd src/backend
   dotnet test
   
   # Frontend tests
   cd src/frontend/clean-architecture-generator
   npm test
   npm run e2e
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add entity validation feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

## 📏 Coding Standards

### Backend (.NET)

#### Naming Conventions
```csharp
// Classes and interfaces - PascalCase
public class ProjectGeneratorService : IProjectGeneratorService

// Methods and properties - PascalCase
public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata)

// Private fields - camelCase with underscore prefix
private readonly ILogger<ProjectGeneratorService> _logger;

// Local variables and parameters - camelCase
public void ProcessEntity(Entity entity)
{
    var entityName = entity.Name;
}

// Constants - PascalCase
public const string DefaultNamespace = "CleanArchitecture";
```

#### Code Style
```csharp
// Use explicit types when not obvious
Dictionary<string, List<Entity>> entityGroups = new();

// Use var when type is obvious
var service = new ProjectGeneratorService();

// Async methods should end with "Async"
public async Task<ValidationResult> ValidateProjectAsync(ProjectMetadata metadata)

// Use ConfigureAwait(false) in library code
var result = await ProcessDataAsync().ConfigureAwait(false);

// Use meaningful names
public class EntityValidationRule  // Good
public class EVR                   // Bad
```

### Frontend (Angular/TypeScript)

#### Naming Conventions
```typescript
// Classes and interfaces - PascalCase
export class ProjectStateService implements OnDestroy
export interface ProjectMetadata

// Methods and properties - camelCase
public updateProjectName(name: string): void
private readonly projectSubject = new BehaviorSubject<ProjectMetadata>();

// Constants - UPPER_SNAKE_CASE
export const DEFAULT_PROJECT_NAME = 'NewProject';

// Files - kebab-case
project-state.service.ts
entity-panel.component.ts
```

#### Component Structure
```typescript
@Component({
  selector: 'app-entity-panel',
  standalone: true,
  imports: [CommonModule, MaterialModules],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- template -->`,
  styles: [`/* styles */`]
})
export class EntityPanelComponent implements OnInit, OnDestroy {
  // Public properties first
  entities$ = this.projectState.entities$;
  
  // Private properties
  private readonly destroy$ = new Subject<void>();
  
  // Constructor
  constructor(private projectState: ProjectStateService) {}
  
  // Lifecycle hooks
  ngOnInit(): void { }
  ngOnDestroy(): void { }
  
  // Public methods
  onAddEntity(): void { }
  
  // Private methods
  private validateEntity(): boolean { }
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
    
    [TestInitialize]
    public void Setup()
    {
        _mockZipService = new Mock<IZipService>();
        _service = new ProjectGeneratorService(_mockZipService.Object);
    }
    
    [TestMethod]
    public async Task GenerateProjectAsync_ValidInput_ReturnsSuccess()
    {
        // Arrange
        var metadata = CreateValidMetadata();
        
        // Act
        var result = await _service.GenerateProjectAsync(metadata, "output");
        
        // Assert
        Assert.IsTrue(result.Success);
    }
    
    private ProjectMetadata CreateValidMetadata()
    {
        return new ProjectMetadata
        {
            ProjectName = "TestProject",
            Entities = new List<Entity> { /* test data */ }
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
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }
    
    [TestMethod]
    public async Task GenerateProject_ValidRequest_ReturnsOk()
    {
        // Test implementation
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
});
```

#### Component Tests
```typescript
describe('EntityPanelComponent', () => {
  let component: EntityPanelComponent;
  let fixture: ComponentFixture<EntityPanelComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityPanelComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(EntityPanelComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Test Coverage
- Aim for **80%+ code coverage**
- Focus on **critical business logic**
- Test **error scenarios**
- Include **integration tests** for API endpoints

## 📚 Documentation

### Code Documentation
```csharp
/// <summary>
/// Generates a Clean Architecture project based on the provided metadata
/// </summary>
/// <param name="metadata">Project configuration and entity definitions</param>
/// <param name="outputPath">Directory where the project will be generated</param>
/// <returns>Generation result with success status and file list</returns>
/// <exception cref="ValidationException">Thrown when metadata validation fails</exception>
public async Task<GenerationResult> GenerateProjectAsync(ProjectMetadata metadata, string outputPath)
```

```typescript
/**
 * Updates the project name in the current project state
 * @param name The new project name
 * @throws Error if name is empty or invalid
 */
updateProjectName(name: string): void {
  if (!name?.trim()) {
    throw new Error('Project name cannot be empty');
  }
  // Implementation
}
```

### README Updates
- Update feature lists when adding new functionality
- Add new configuration options
- Update installation instructions if needed

### API Documentation
- Update OpenAPI/Swagger documentation
- Add examples for new endpoints
- Document new request/response models

## 🔍 Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   # Backend
   dotnet test
   
   # Frontend
   npm test
   npm run e2e
   ```

2. **Check code formatting**
   ```bash
   # Backend - use .editorconfig
   # Frontend
   npm run lint
   npm run format
   ```

3. **Update documentation**
   - Add/update code comments
   - Update README if needed
   - Update API documentation

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass
2. **At least one reviewer** approval required
3. **All conversations** must be resolved
4. **Squash and merge** for clean history

### After Merge

1. **Delete feature branch**
2. **Update local repository**
   ```bash
   git checkout develop
   git pull upstream develop
   git branch -d feature/your-feature-name
   ```

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

## 📞 Getting Help

- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bug reports and feature requests
- **Discord/Slack** - Real-time chat (if available)
- **Email** - For sensitive issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the Clean Architecture Template Generator! 🚀
