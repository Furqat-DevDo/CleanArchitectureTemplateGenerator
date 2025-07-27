# Clean Architecture Template Generator Documentation

Welcome to the comprehensive documentation for the Clean Architecture Template Generator project.

## 📚 Documentation Structure

### Core Documentation
- [**Project Overview**](./01-project-overview.md) - High-level architecture and purpose
- [**Getting Started**](./02-getting-started.md) - Installation and basic usage
- [**Architecture Deep Dive**](./03-architecture.md) - Detailed technical architecture
- [**Configuration Guide**](./04-configuration.md) - JSON metadata configuration
- [**Template System**](./05-template-system.md) - Scriban templating engine details

### Technical References
- [**Package Dependencies**](./06-package-dependencies.md) - All NuGet packages and their purposes
- [**Generated Structure**](./07-generated-structure.md) - Output project structure
- [**Code Examples**](./08-code-examples.md) - Generated code samples
- [**API Reference**](./09-api-reference.md) - Core classes and methods

### Advanced Topics
- [**Extending Templates**](./10-extending-templates.md) - How to create custom templates
- [**Troubleshooting**](./11-troubleshooting.md) - Common issues and solutions
- [**Best Practices**](./12-best-practices.md) - Recommended usage patterns

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd CleanArchitectureTemplateGenerator

# Build the solution
dotnet build

# Generate a sample project
dotnet run --project CleanArchitectureTemplateGenerator.CLI -- \
  --metadata SampleMetadata.json \
  --output ./output \
  --templates ./templates
```

## 🏗️ What This Tool Generates

The Clean Architecture Template Generator creates a complete .NET solution following Clean Architecture principles:

- **Domain Layer**: Entities, Value Objects, Domain Services
- **Application Layer**: Commands, Queries, DTOs, Handlers (CQRS pattern)
- **Infrastructure Layer**: Repository implementations, Data access
- **Presentation Layer**: API Controllers, Middleware

## 🎯 Key Features

- ✅ **Metadata-driven generation** - Configure via JSON
- ✅ **Clean Architecture compliance** - Proper layer separation
- ✅ **CQRS pattern implementation** - Commands and Queries
- ✅ **Repository pattern** - Data access abstraction
- ✅ **Mediator pattern** - Decoupled request handling
- ✅ **Extensible templating** - Scriban template engine
- ✅ **Modern .NET 8** - Latest framework features

## 📋 Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022 or VS Code (recommended)
- Basic understanding of Clean Architecture principles

## 🤝 Contributing

Please read our contributing guidelines and feel free to submit issues and enhancement requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
