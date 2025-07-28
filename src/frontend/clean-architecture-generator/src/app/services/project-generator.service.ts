import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ProjectMetadata } from '../models/project.models';
import * as signalR from '@microsoft/signalr';

export interface GenerateProjectRequest {
  metadata: ProjectMetadata;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateInfo {
  availableTemplates: string[];
  version: string;
  lastUpdated: string;
}

export interface GenerationProgress {
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

export interface GenerationJobStatus {
  jobId: string;
  status: string; // "pending", "running", "completed", "failed"
  progress?: GenerationProgress;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AsyncGenerationResponse {
  jobId: string;
  message: string;
  statusUrl: string;
  progressUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectGeneratorService {
  private readonly apiUrl = 'http://localhost:5000/api/ProjectGenerator';
  private readonly hubUrl = 'http://localhost:5000/hub/generation-progress';

  private hubConnection?: signalR.HubConnection;
  private progressSubject = new Subject<GenerationProgress>();
  private connectionStateSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initializeSignalRConnection();
  }

  validateMetadata(metadata: ProjectMetadata): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate`, metadata);
  }

  generateProject(metadata: ProjectMetadata): Observable<Blob> {
    const request: GenerateProjectRequest = { metadata };

    return this.http.post(`${this.apiUrl}/generate`, request, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  getTemplateInfo(): Observable<TemplateInfo> {
    return this.http.get<TemplateInfo>(`${this.apiUrl}/templates`);
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Async generation methods
  generateProjectAsync(metadata: ProjectMetadata): Observable<AsyncGenerationResponse> {
    const request: GenerateProjectRequest = { metadata };

    return this.http.post<AsyncGenerationResponse>(`${this.apiUrl}/generate-async`, request, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  getJobStatus(jobId: string): Observable<GenerationJobStatus> {
    return this.http.get<GenerationJobStatus>(`${this.apiUrl}/status/${jobId}`);
  }

  downloadProject(jobId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${jobId}`, {
      responseType: 'blob'
    });
  }

  // SignalR methods
  private async initializeSignalRConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ProgressUpdate', (progress: GenerationProgress) => {
      this.progressSubject.next(progress);
    });

    this.hubConnection.on('GenerationCompleted', (result: any) => {
      console.log('Generation completed:', result);
    });

    this.hubConnection.on('GenerationError', (error: string) => {
      console.error('Generation error:', error);
    });

    try {
      await this.hubConnection.start();
      this.connectionStateSubject.next(true);
      console.log('SignalR connection established');
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      this.connectionStateSubject.next(false);
    }
  }

  async trackJob(jobId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinJobGroup', jobId);
    }
  }

  async stopTrackingJob(jobId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveJobGroup', jobId);
    }
  }

  getProgressUpdates(): Observable<GenerationProgress> {
    return this.progressSubject.asObservable();
  }

  getConnectionState(): Observable<boolean> {
    return this.connectionStateSubject.asObservable();
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionStateSubject.next(false);
    }
  }
}
