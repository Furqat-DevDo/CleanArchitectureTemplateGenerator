# Clean Architecture Template Generator

A modern, full-stack application for generating Clean Architecture project templates with real-time progress tracking and professional UI.

## 🚀 Overview

The Clean Architecture Template Generator is a comprehensive solution that helps developers quickly scaffold Clean Architecture projects with proper domain modeling, entity relationships, and validation rules. It features a modern Angular frontend with Material Design and a robust .NET backend with SignalR for real-time updates.

## ✨ Key Features

### 🎨 **Modern Frontend (Angular 18)**
- **Professional Material Design UI** with custom styling
- **Real-time progress tracking** via SignalR
- **Drag-and-drop flowchart interface** for visual design
- **Responsive design** for desktop, tablet, and mobile
- **Entity relationship modeling** with visual connections
- **Validation rule management** with real-time feedback

### ⚡ **Robust Backend (.NET 8)**
- **Asynchronous project generation** with background processing
- **SignalR real-time communication** for progress updates
- **RESTful API** with comprehensive error handling
- **Template engine** for code generation
- **Zip file creation** and secure downloads
- **Clean Architecture implementation** as example

### 🔧 **Advanced Features**
- **Job queue system** for handling multiple generation requests
- **Progress tracking** with step-by-step updates
- **Error handling** with detailed user feedback
- **File management** with automatic cleanup
- **CORS configuration** for cross-origin requests
- **Professional logging** and monitoring

## 📁 Project Structure

```
CleanArchitectureTemplateGenerator/
├── src/
│   ├── backend/                          # .NET 8 Backend
│   │   ├── CleanArchitectureTemplateGenerator/     # Web API
│   │   └── CleanArchitectureTemplateGenerator.Core/ # Core Logic
│   └── frontend/                         # Angular 18 Frontend
│       └── clean-architecture-generator/
├── docs/                                 # Documentation
├── templates/                            # Code Templates
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **.NET 8 SDK** or later
- **Node.js 18+** and npm
- **Angular CLI 18+**
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CleanArchitectureTemplateGenerator
```

### 2. Start the Backend
```bash
cd src/backend/CleanArchitectureTemplateGenerator
dotnet restore
dotnet run
```
Backend will be available at: `http://localhost:5000`

### 3. Start the Frontend
```bash
cd src/frontend/clean-architecture-generator
npm install
ng serve
```
Frontend will be available at: `http://localhost:4200`

### 4. Open the Application
Navigate to `http://localhost:4200` in your browser and start designing your Clean Architecture project!

## 📖 Documentation

- **[Architecture Guide](./architecture.md)** - Detailed system architecture
- **[API Documentation](./api.md)** - Complete API reference
- **[Frontend Guide](./frontend.md)** - Angular frontend documentation
- **[Backend Guide](./backend.md)** - .NET backend documentation
- **[User Guide](./user-guide.md)** - How to use the application
- **[Development Guide](./development.md)** - Development setup and guidelines
- **[Deployment Guide](./deployment.md)** - Production deployment instructions

## 🎯 Use Cases

### For Developers
- **Rapid prototyping** of Clean Architecture projects
- **Learning Clean Architecture** patterns and best practices
- **Standardizing project structure** across teams
- **Generating boilerplate code** with proper patterns

### For Teams
- **Project scaffolding** with consistent structure
- **Code review templates** for architecture compliance
- **Training material** for Clean Architecture concepts
- **Documentation generation** for project specifications

### For Architects
- **Design validation** through visual modeling
- **Architecture documentation** with entity relationships
- **Template customization** for organizational standards
- **Best practice enforcement** through generated code

## 🛠️ Technology Stack

### Frontend
- **Angular 18** - Modern web framework
- **Material Design** - Professional UI components
- **TypeScript** - Type-safe development
- **SignalR Client** - Real-time communication
- **RxJS** - Reactive programming
- **SCSS** - Advanced styling

### Backend
- **.NET 8** - High-performance runtime
- **ASP.NET Core** - Web API framework
- **SignalR** - Real-time communication
- **Entity Framework Core** - Data access (future)
- **Swagger/OpenAPI** - API documentation
- **Serilog** - Structured logging (future)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./contributing.md) for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs folder](./README.md)
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Wiki**: Additional resources and examples

## 🎉 Acknowledgments

- **Clean Architecture** concepts by Robert C. Martin
- **Angular Team** for the excellent framework
- **Material Design** for the design system
- **Microsoft** for .NET and SignalR
- **Community contributors** and feedback

---

**Built with ❤️ for the developer community**
