# Frontend Documentation

## 🎨 Overview

The frontend is built with **Angular 18** and **Material Design**, providing a modern, responsive, and professional user interface for designing Clean Architecture projects.

## 🛠️ Technology Stack

### Core Technologies
- **Angular 18** - Modern web framework with standalone components
- **TypeScript 5.4+** - Type-safe development
- **Material Design 18** - Professional UI components
- **SCSS** - Advanced styling with custom themes
- **RxJS** - Reactive programming for async operations

### Key Libraries
- **@microsoft/signalr** - Real-time communication
- **@angular/material** - Material Design components
- **@angular/cdk** - Component development kit
- **rxjs** - Reactive extensions

## 📁 Project Structure

```
src/app/
├── components/                    # UI Components
│   ├── main-layout.component.*   # Main application shell
│   ├── panels/                   # Side panel components
│   │   ├── entities-panel.*      # Entity management
│   │   ├── relationships-panel.* # Relationship management
│   │   ├── validations-panel.*   # Validation rules
│   │   └── project-panel.*       # Project settings
│   ├── dialogs/                  # Modal dialogs
│   │   └── generation-progress-dialog.* # Progress tracking
│   └── flowchart-canvas.*        # Visual design canvas
├── services/                     # Business logic services
│   ├── project-state.service.*   # Application state management
│   └── project-generator.service.* # API communication
├── models/                       # TypeScript interfaces
│   └── project.models.*          # Data models
└── styles/                       # Global styles
    └── styles.scss               # Material Design customization
```

## 🧩 Component Architecture

### Main Layout Component
The root component that orchestrates the entire application.

**Features:**
- **Responsive layout** with Material Design sidenav
- **Professional header** with gradient styling
- **Navigation menu** with active state indicators
- **Content area** with dynamic panel switching
- **Generation controls** with progress tracking

**Key Methods:**
```typescript
generateProject(): void          // Start async project generation
selectPanel(panel: string): void // Switch between panels
validateProject(): boolean       // Validate before generation
```

### Panel Components

#### Entities Panel
Manages entity definitions and properties.

**Features:**
- **Entity creation** with name and description
- **Property management** with types and constraints
- **Validation rules** for entity properties
- **Visual indicators** for entity status

#### Relationships Panel
Defines relationships between entities.

**Features:**
- **Relationship types** (OneToOne, OneToMany, etc.)
- **Foreign key configuration**
- **Navigation property setup**
- **Visual relationship mapping**

#### Project Panel
Configures project-wide settings.

**Features:**
- **Project metadata** (name, description, namespace)
- **Target framework** selection
- **Generation options** configuration
- **Template selection**

### Dialog Components

#### Generation Progress Dialog
Shows real-time progress during project generation.

**Features:**
- **Progress bar** with percentage completion
- **Step-by-step updates** via SignalR
- **Status indicators** (pending, running, completed, failed)
- **Download button** when generation completes
- **Error handling** with detailed messages

## 🔄 State Management

### Project State Service
Centralized state management for the application.

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectStateService {
  private projectSubject = new BehaviorSubject<ProjectMetadata>(defaultProject);
  
  // Observable for components to subscribe to
  project$ = this.projectSubject.asObservable();
  
  // State management methods
  updateProject(project: ProjectMetadata): void
  addEntity(entity: Entity): void
  updateEntity(index: number, entity: Entity): void
  removeEntity(index: number): void
  addRelationship(relationship: Relationship): void
  // ... more methods
}
```

**Key Features:**
- **Reactive state updates** using RxJS
- **Immutable state management**
- **Type-safe operations**
- **Automatic persistence** (future enhancement)

## 🌐 API Integration

### Project Generator Service
Handles all API communication and SignalR connections.

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectGeneratorService {
  private readonly apiUrl = 'http://localhost:5000/api/ProjectGenerator';
  private hubConnection?: signalR.HubConnection;
  
  // API methods
  generateProject(metadata: ProjectMetadata): Observable<Blob>
  generateProjectAsync(metadata: ProjectMetadata): Observable<AsyncGenerationResponse>
  getJobStatus(jobId: string): Observable<GenerationJobStatus>
  downloadProject(jobId: string): Observable<Blob>
  
  // SignalR methods
  getProgressUpdates(): Observable<GenerationProgress>
  trackJob(jobId: string): Promise<void>
  stopTrackingJob(jobId: string): Promise<void>
}
```

**Key Features:**
- **HTTP client** for REST API calls
- **SignalR integration** for real-time updates
- **Error handling** with proper error types
- **File download** management

## 🎨 Styling and Theming

### Material Design Customization
Custom theme with professional color palette.

```scss
// Primary color palette
$primary-palette: (
  50: #f0f4ff,
  100: #d6e4ff,
  500: #667eea,
  700: #5a67d8,
  900: #4c51bf,
  // ... more shades
);

// Custom theme
$app-primary: mat.define-palette($primary-palette);
$app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$app-theme: mat.define-light-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
  )
));
```

### Component Styling
Each component has its own SCSS file with:
- **BEM methodology** for CSS class naming
- **Responsive design** with breakpoints
- **Material Design** component customization
- **Professional animations** and transitions

### Global Styles
```scss
// Typography
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}

// Material Icons
.material-icons {
  font-family: 'Material Icons' !important;
  // ... icon styling
}

// Custom utilities
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 📱 Responsive Design

### Breakpoints
```scss
$breakpoints: (
  mobile: 480px,
  tablet: 768px,
  desktop: 1024px,
  large: 1200px
);
```

### Layout Adaptations
- **Mobile**: Single column layout with collapsible panels
- **Tablet**: Two-column layout with side navigation
- **Desktop**: Full three-column layout with all panels visible
- **Large**: Optimized spacing for large screens

## ⚡ Performance Optimizations

### Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ... component config
})
```

### Lazy Loading
```typescript
// Future enhancement for route-based lazy loading
const routes: Routes = [
  {
    path: 'designer',
    loadComponent: () => import('./designer/designer.component')
  }
];
```

### Bundle Optimization
- **Tree shaking** for unused code elimination
- **Code splitting** for optimal loading
- **Lazy loading** of heavy components
- **Service worker** for caching (future)

## 🧪 Testing Strategy

### Unit Testing
```typescript
describe('ProjectStateService', () => {
  let service: ProjectStateService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectStateService);
  });
  
  it('should add entity to project', () => {
    const entity: Entity = { name: 'User', properties: [] };
    service.addEntity(entity);
    
    service.project$.subscribe(project => {
      expect(project.entities).toContain(entity);
    });
  });
});
```

### Integration Testing
```typescript
describe('GenerationProgressDialog', () => {
  let component: GenerationProgressDialogComponent;
  let mockService: jasmine.SpyObj<ProjectGeneratorService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('ProjectGeneratorService', ['trackJob']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: ProjectGeneratorService, useValue: spy }
      ]
    });
    
    mockService = TestBed.inject(ProjectGeneratorService) as jasmine.SpyObj<ProjectGeneratorService>;
  });
  
  it('should track job on init', () => {
    component.ngOnInit();
    expect(mockService.trackJob).toHaveBeenCalled();
  });
});
```

### E2E Testing
```typescript
describe('Project Generation Flow', () => {
  it('should generate project successfully', () => {
    cy.visit('/');
    cy.get('[data-cy=project-name]').type('TestProject');
    cy.get('[data-cy=add-entity]').click();
    cy.get('[data-cy=entity-name]').type('User');
    cy.get('[data-cy=generate-project]').click();
    cy.get('[data-cy=progress-dialog]').should('be.visible');
    cy.get('[data-cy=download-button]').should('be.enabled');
  });
});
```

## 🔧 Development Guidelines

### Code Style
- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

### Component Guidelines
```typescript
// Use standalone components
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MaterialModules],
  // ... component config
})

// Implement OnDestroy for cleanup
export class ExampleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Service Guidelines
```typescript
// Use providedIn: 'root' for singletons
@Injectable({ providedIn: 'root' })
export class ExampleService {
  // Use private subjects with public observables
  private dataSubject = new BehaviorSubject<Data[]>([]);
  data$ = this.dataSubject.asObservable();
  
  // Handle errors properly
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data')
      .pipe(
        catchError(error => {
          console.error('Error fetching data:', error);
          return throwError(() => error);
        })
      );
  }
}
```

## 🚀 Build and Deployment

### Development Build
```bash
ng serve --configuration development
```

### Production Build
```bash
ng build --configuration production
```

### Build Optimization
- **Ahead-of-Time (AOT)** compilation
- **Tree shaking** for smaller bundles
- **Minification** and compression
- **Source maps** for debugging

### Environment Configuration
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  signalRUrl: 'http://localhost:5000/hub'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com/api',
  signalRUrl: 'https://api.example.com/hub'
};
```

## 🔍 Debugging and Troubleshooting

### Common Issues

#### SignalR Connection Issues
```typescript
// Check connection state
if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
  // Connection is active
} else {
  // Reconnect logic
  await this.initializeSignalRConnection();
}
```

#### Material Icons Not Loading
```html
<!-- Ensure Material Icons font is loaded -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

#### CORS Issues
```typescript
// Ensure backend CORS is configured for frontend URL
// Backend: Program.cs
builder.Services.AddCors(options => {
  options.AddPolicy("AllowAngular", policy => {
    policy.WithOrigins("http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
  });
});
```

### Development Tools
- **Angular DevTools** browser extension
- **Redux DevTools** for state debugging
- **Chrome DevTools** for performance profiling
- **Lighthouse** for performance auditing

---

For more detailed examples and advanced usage, see the [User Guide](./user-guide.md) and [Development Guide](./development.md).
