import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectMetadata } from '../models/project.models';

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

@Injectable({
  providedIn: 'root'
})
export class ProjectGeneratorService {
  private readonly apiUrl = 'http://localhost:5000/api/ProjectGenerator';

  constructor(private http: HttpClient) {}

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
}
