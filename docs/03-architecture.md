# Architecture Deep Dive

## Solution Structure

The Clean Architecture Template Generator follows a modular architecture with clear separation of concerns.

```mermaid
graph TB
    subgraph "Solution Structure"
        SOLUTION[CleanArchitectureTemplateGenerator.sln]
        
        subgraph "CLI Project"
            CLI_PROJ[CleanArchitectureTemplateGenerator.CLI]
            CLI_PROGRAM[Program.cs<br/>Entry Point & Command Line Parsing]
            CLI_CSPROJ[CLI.csproj<br/>System.CommandLine Package]
        end
        
        subgraph "Core Project"
            CORE_PROJ[CleanArchitectureTemplateGenerator.Core]
            
            subgraph "Models"
                PROJECT_META[ProjectMetadata.cs]
                ENTITY_META[EntityMetadata.cs]
                PROP_META[PropertyMetadata.cs]
                CMD_META[CommandMetadata.cs]
                QUERY_META[QueryMetadata.cs]
                GEN_OPTIONS[GenerationOptions.cs]
            end
            
            subgraph "Services"
                PROJECT_GEN[ProjectGenerator.cs<br/>Main Generation Logic]
                TEMPLATE_HELPER[TemplateHelper.cs<br/>Utility Functions]
            end
            
            CORE_CSPROJ[Core.csproj<br/>Newtonsoft.Json & Scriban]
        end
        
        subgraph "Templates"
            DOMAIN_TEMPLATES[Domain Templates<br/>Entity.sbn, IRepository.sbn]
            APP_TEMPLATES[Application Templates<br/>CommandHandler.sbn, QueryHandler.sbn, Dto.sbn]
            INFRA_TEMPLATES[Infrastructure Templates<br/>Repository.sbn]
            PRES_TEMPLATES[Presentation Templates<br/>Controller.sbn]
        end
        
        subgraph "Configuration"
            SAMPLE_JSON[SampleMetadata.json<br/>Example Configuration]
        end
    end
    
    CLI_PROJ --> CORE_PROJ
    PROJECT_GEN --> DOMAIN_TEMPLATES
    PROJECT_GEN --> APP_TEMPLATES
    PROJECT_GEN --> INFRA_TEMPLATES
    PROJECT_GEN --> PRES_TEMPLATES
    
    style CLI_PROJ fill:#ffecb3
    style CORE_PROJ fill:#e8f5e8
    style DOMAIN_TEMPLATES fill:#e1f5fe
    style APP_TEMPLATES fill:#e1f5fe
    style INFRA_TEMPLATES fill:#e1f5fe
    style PRES_TEMPLATES fill:#e1f5fe
```

## Data Model Architecture

The core data models represent the metadata structure used for code generation:

```mermaid
classDiagram
    class ProjectMetadata {
        +string ProjectName
        +List~EntityMetadata~ Entities
        +GenerationOptions Options
    }
    
    class EntityMetadata {
        +string Name
        +List~PropertyMetadata~ Properties
        +List~CommandMetadata~ Commands
        +List~QueryMetadata~ Queries
    }
    
    class PropertyMetadata {
        +string Name
        +string Type
        +bool IsKey
        +bool Required
    }
    
    class CommandMetadata {
        +string Name
        +string Type
        +string ResultType
    }
    
    class QueryMetadata {
        +string Name
        +string Type
        +string ResultType
    }
    
    class GenerationOptions {
        +bool UseFluentValidation
        +bool UseAutoMapper
        +bool UseMediatR
        +string Database
        +string Authentication
    }
    
    ProjectMetadata ||--o{ EntityMetadata : contains
    ProjectMetadata ||--|| GenerationOptions : has
    EntityMetadata ||--o{ PropertyMetadata : has
    EntityMetadata ||--o{ CommandMetadata : has
    EntityMetadata ||--o{ QueryMetadata : has
    
    note for ProjectMetadata "Root configuration object\nDeserialized from JSON"
    note for EntityMetadata "Represents a domain entity\nwith its operations"
    note for PropertyMetadata "Entity property definition\nwith type and constraints"
```

## Core Components

### 1. CLI Application Layer

**Purpose**: Provides the command-line interface for the tool.

**Key Classes**:
- `Program.cs`: Entry point with System.CommandLine configuration

**Responsibilities**:
- Parse command-line arguments
- Validate input parameters
- Initialize and execute the core generation engine
- Handle errors and provide user feedback

### 2. Core Business Logic

**Purpose**: Contains the main generation logic and data models.

**Key Classes**:
- `ProjectGenerator`: Main orchestrator for code generation
- `TemplateHelper`: Utility functions for template processing
- Model classes: Data structures for metadata

**Responsibilities**:
- Parse and validate JSON metadata
- Orchestrate the generation process
- Process templates with Scriban
- Create output directory structure
- Generate all code files

### 3. Template System

**Purpose**: Defines the structure and content of generated code.

**Template Categories**:
- **Domain**: Entities, repository interfaces
- **Application**: Commands, queries, DTOs, handlers
- **Infrastructure**: Repository implementations
- **Presentation**: API controllers

## Generation Process Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI as CLI Application
    participant Core as Core Engine
    participant JSON as JSON Parser
    participant Scriban as Template Engine
    participant FileSystem as File System
    
    User->>CLI: Execute command with parameters
    Note over User,CLI: dotnet run --metadata config.json --output ./output --templates ./templates
    
    CLI->>Core: Initialize ProjectGenerator
    Core->>JSON: Deserialize metadata JSON
    JSON-->>Core: ProjectMetadata object
    
    Core->>Core: Create project structure
    Core->>FileSystem: Create directories
    
    loop For each entity
        Core->>Scriban: Load template file
        Core->>Scriban: Pass model data + helper functions
        Scriban->>Scriban: Process template with data
        Scriban-->>Core: Generated code content
        Core->>FileSystem: Write generated file
    end
    
    Core->>FileSystem: Generate solution file
    Core-->>CLI: Generation complete
    CLI-->>User: Success message
    
    Note over User,FileSystem: Complete Clean Architecture project generated
```

## Template Engine Architecture

```mermaid
graph TB
    subgraph "Input Data"
        JSON_CONFIG[SampleMetadata.json<br/>Configuration]
        TEMPLATE_FILES[Template Files<br/>.sbn files]
    end
    
    subgraph "Processing"
        DESERIALIZE[JSON Deserialization<br/>Newtonsoft.Json]
        MODEL_TRANSFORM[Model Transformation<br/>Anonymous Objects]
        SCRIBAN_ENGINE[Scriban Template Engine<br/>Template Processing]
        HELPER_FUNCS[Helper Functions<br/>Type Mapping, String Utils]
    end
    
    subgraph "Output"
        GENERATED_FILES[Generated C# Files<br/>Entities, DTOs, Controllers, etc.]
    end
    
    JSON_CONFIG --> DESERIALIZE
    DESERIALIZE --> MODEL_TRANSFORM
    TEMPLATE_FILES --> SCRIBAN_ENGINE
    MODEL_TRANSFORM --> SCRIBAN_ENGINE
    HELPER_FUNCS --> SCRIBAN_ENGINE
    SCRIBAN_ENGINE --> GENERATED_FILES
    
    style JSON_CONFIG fill:#e1f5fe
    style TEMPLATE_FILES fill:#e1f5fe
    style SCRIBAN_ENGINE fill:#fff3e0
    style GENERATED_FILES fill:#e8f5e8
```

## Key Design Decisions

### 1. Separation of Concerns
- **CLI layer**: Only handles user interaction and command parsing
- **Core layer**: Contains all business logic and generation algorithms
- **Templates**: Separate from code, allowing easy customization

### 2. Metadata-Driven Approach
- **JSON configuration**: Human-readable and version-controllable
- **Flexible schema**: Supports various entity types and operations
- **Extensible options**: Easy to add new generation features

### 3. Template Engine Choice (Scriban)
- **Performance**: Fast template processing
- **Features**: Rich templating language with loops, conditionals
- **Safety**: Secure template execution
- **Extensibility**: Custom function registration

### 4. Clean Architecture Compliance
- **Dependency Direction**: Dependencies point inward
- **Layer Isolation**: Each layer has specific responsibilities
- **Testability**: Loose coupling enables easy unit testing

## Error Handling Strategy

### 1. Input Validation
- Command-line parameter validation
- JSON schema validation
- File existence checks

### 2. Generation Errors
- Template parsing errors
- File system access errors
- Model transformation errors

### 3. User Feedback
- Clear error messages
- Progress indicators
- Success confirmations

## Performance Considerations

### 1. Template Caching
- Templates are loaded once per generation
- Compiled templates for better performance

### 2. Async Operations
- File I/O operations are asynchronous
- Parallel processing where possible

### 3. Memory Management
- Efficient object creation
- Proper disposal of resources

## Extensibility Points

### 1. New Templates
- Add new `.sbn` files to templates directory
- Register in `ProjectGenerator` class

### 2. Custom Helper Functions
- Add to `TemplateHelper` class
- Register in Scriban context

### 3. New Metadata Properties
- Extend model classes
- Update JSON schema
- Modify templates accordingly

## Next Steps

- [Configuration Guide](./04-configuration.md) - Learn about JSON metadata
- [Template System](./05-template-system.md) - Deep dive into templating
- [Extending Templates](./10-extending-templates.md) - Create custom templates
