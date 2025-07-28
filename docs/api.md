# API Documentation

## 🌐 Base URL
```
http://localhost:5000/api
```

## 📋 Table of Contents
- [Project Generator API](#project-generator-api)
- [SignalR Hub](#signalr-hub)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Authentication](#authentication)

## 🚀 Project Generator API

### Generate Project (Synchronous)
Generate a project and return the zip file directly.

**Endpoint:** `POST /ProjectGenerator/generate`

**Request Body:**
```json
{
  "metadata": {
    "projectName": "MyCleanProject",
    "description": "A sample clean architecture project",
    "namespace": "MyCompany.MyProject",
    "targetFramework": "net8.0",
    "entities": [
      {
        "name": "User",
        "properties": [
          {
            "name": "Id",
            "type": "int",
            "isKey": true,
            "isRequired": true
          },
          {
            "name": "Email",
            "type": "string",
            "isRequired": true,
            "maxLength": 255
          }
        ]
      }
    ],
    "relationships": [],
    "validations": []
  }
}
```

**Response:**
- **Content-Type:** `application/zip`
- **Status:** `200 OK`
- **Body:** Binary zip file

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `500 Internal Server Error` - Generation failed

---

### Generate Project (Asynchronous)
Start asynchronous project generation and return job ID for tracking.

**Endpoint:** `POST /ProjectGenerator/generate-async`

**Request Body:** Same as synchronous endpoint

**Response:**
```json
{
  "jobId": "abc123-def456-ghi789",
  "message": "Project generation started. Use the job ID to track progress.",
  "statusUrl": "/api/ProjectGenerator/status/abc123-def456-ghi789",
  "progressUrl": "/hub/generation-progress"
}
```

**Status Codes:**
- `202 Accepted` - Generation started successfully
- `400 Bad Request` - Invalid request data
- `500 Internal Server Error` - Failed to start generation

---

### Get Job Status
Check the status of an asynchronous generation job.

**Endpoint:** `GET /ProjectGenerator/status/{jobId}`

**Parameters:**
- `jobId` (string, required) - The job identifier

**Response:**
```json
{
  "jobId": "abc123-def456-ghi789",
  "status": "running",
  "progress": {
    "jobId": "abc123-def456-ghi789",
    "totalSteps": 5,
    "completedSteps": 3,
    "currentStep": "Processing templates and generating files...",
    "percentageComplete": 60.0,
    "isCompleted": false,
    "hasError": false,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "createdAt": "2024-01-15T10:25:00Z"
}
```

**Status Values:**
- `pending` - Job is queued for processing
- `running` - Job is currently being processed
- `completed` - Job completed successfully
- `failed` - Job failed with errors

**Status Codes:**
- `200 OK` - Status retrieved successfully
- `404 Not Found` - Job not found
- `500 Internal Server Error` - Error retrieving status

---

### Download Generated Project
Download the generated project zip file.

**Endpoint:** `GET /ProjectGenerator/download/{jobId}`

**Parameters:**
- `jobId` (string, required) - The job identifier

**Response:**
- **Content-Type:** `application/zip`
- **Content-Disposition:** `attachment; filename="ProjectName_20240115_103000.zip"`
- **Status:** `200 OK`
- **Body:** Binary zip file

**Status Codes:**
- `200 OK` - File downloaded successfully
- `404 Not Found` - Job not found or file not ready
- `500 Internal Server Error` - Error downloading file

---

### Validate Project
Validate project metadata without generating the project.

**Endpoint:** `POST /ProjectGenerator/validate`

**Request Body:** Same as generate endpoint

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Entity 'User' has no relationships defined"
  ]
}
```

**Status Codes:**
- `200 OK` - Validation completed
- `400 Bad Request` - Invalid request format

---

### Get Template Information
Retrieve information about available templates.

**Endpoint:** `GET /ProjectGenerator/templates`

**Response:**
```json
{
  "availableTemplates": [
    "CleanArchitecture.WebApi",
    "CleanArchitecture.Blazor",
    "CleanArchitecture.Console"
  ],
  "version": "1.0.0",
  "lastUpdated": "2024-01-15T09:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Template information retrieved
- `500 Internal Server Error` - Error retrieving templates

## 🔄 SignalR Hub

### Connection
**Hub URL:** `/hub/generation-progress`

### Methods

#### Join Job Group
Subscribe to progress updates for a specific job.

```typescript
await connection.invoke('JoinJobGroup', jobId);
```

#### Leave Job Group
Unsubscribe from progress updates for a specific job.

```typescript
await connection.invoke('LeaveJobGroup', jobId);
```

### Events

#### Progress Update
Receive real-time progress updates.

```typescript
connection.on('ProgressUpdate', (progress: GenerationProgress) => {
  console.log(`Progress: ${progress.percentageComplete}%`);
  console.log(`Current step: ${progress.currentStep}`);
});
```

#### Generation Completed
Receive notification when generation is complete.

```typescript
connection.on('GenerationCompleted', (result: any) => {
  console.log('Generation completed:', result);
});
```

#### Generation Error
Receive notification when generation fails.

```typescript
connection.on('GenerationError', (error: string) => {
  console.error('Generation failed:', error);
});
```

## 📊 Data Models

### ProjectMetadata
```typescript
interface ProjectMetadata {
  projectName: string;
  description?: string;
  namespace: string;
  targetFramework: string;
  entities: Entity[];
  relationships: Relationship[];
  validations: ValidationRule[];
}
```

### Entity
```typescript
interface Entity {
  name: string;
  properties: Property[];
  description?: string;
}
```

### Property
```typescript
interface Property {
  name: string;
  type: string;
  isKey: boolean;
  isRequired: boolean;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string;
}
```

### Relationship
```typescript
interface Relationship {
  fromEntity: string;
  toEntity: string;
  type: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  foreignKey?: string;
  navigationProperty?: string;
}
```

### ValidationRule
```typescript
interface ValidationRule {
  entityName: string;
  propertyName: string;
  rule: string;
  message: string;
  parameters?: Record<string, any>;
}
```

### GenerationProgress
```typescript
interface GenerationProgress {
  jobId: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  percentageComplete: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  timestamp: Date;
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "detail": "The project name is required and cannot be empty.",
  "instance": "/api/ProjectGenerator/generate",
  "errors": {
    "ProjectName": ["The ProjectName field is required."]
  }
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 400 | Bad Request | Invalid input data, missing required fields |
| 404 | Not Found | Job ID not found, file not available |
| 409 | Conflict | Duplicate entity names, invalid relationships |
| 422 | Unprocessable Entity | Valid format but business rule violations |
| 500 | Internal Server Error | Server errors, file system issues |

### Error Categories

#### Validation Errors (400)
- Missing required fields
- Invalid data types
- Business rule violations

#### Not Found Errors (404)
- Job ID doesn't exist
- Generated file not available
- Template not found

#### Server Errors (500)
- File system errors
- Template processing failures
- Unexpected exceptions

## 🔐 Authentication

### Current Status
The API currently operates without authentication for development purposes.

### Future Authentication
Planned authentication methods:
- **API Key Authentication** for service-to-service calls
- **JWT Bearer Tokens** for user authentication
- **OAuth 2.0** for third-party integrations

### Rate Limiting
Future implementation will include:
- **Request rate limiting** per IP/user
- **Concurrent job limits** per user
- **File download limits** per time period

## 📝 Examples

### Complete Generation Flow
```typescript
// 1. Start async generation
const response = await fetch('/api/ProjectGenerator/generate-async', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ metadata: projectData })
});
const { jobId } = await response.json();

// 2. Connect to SignalR for progress updates
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hub/generation-progress')
  .build();

await connection.start();
await connection.invoke('JoinJobGroup', jobId);

// 3. Listen for progress updates
connection.on('ProgressUpdate', (progress) => {
  updateProgressBar(progress.percentageComplete);
});

// 4. Handle completion
connection.on('GenerationCompleted', async () => {
  const blob = await fetch(`/api/ProjectGenerator/download/${jobId}`)
    .then(r => r.blob());
  downloadFile(blob, 'project.zip');
});
```

---

For more examples and detailed usage, see the [User Guide](./user-guide.md).
