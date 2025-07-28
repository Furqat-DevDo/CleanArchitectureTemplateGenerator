import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { ProjectStateService } from '../../services/project-state.service';
import { ProjectGeneratorService, ValidationResult } from '../../services/project-generator.service';
import { ProjectMetadata } from '../../models/project.models';

@Component({
  selector: 'app-project-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="project-panel">
      <div class="panel-header">
        <h2>
          <mat-icon>settings</mat-icon>
          Project Settings
        </h2>
        <p>Configure your Clean Architecture project settings and generation options.</p>
      </div>

      <div class="panel-content">
        <!-- Basic Project Info -->
        <mat-card class="settings-section">
          <mat-card-header>
            <mat-card-title>Basic Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Project Name</mat-label>
              <input 
                matInput 
                [(ngModel)]="project.projectName" 
                placeholder="Enter project name"
                (ngModelChange)="onProjectNameChange()"
              >
              <mat-hint>This will be used as the solution and namespace name</mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Generation Options -->
        <mat-card class="settings-section">
          <mat-card-header>
            <mat-card-title>Generation Options</mat-card-title>
            <mat-card-subtitle>Choose which patterns and libraries to include</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="options-grid">
              <mat-checkbox 
                [(ngModel)]="project.options.useFluentValidation"
                (ngModelChange)="onOptionsChange()"
              >
                <div class="option-item">
                  <strong>FluentValidation</strong>
                  <small>Input validation with fluent syntax</small>
                </div>
              </mat-checkbox>

              <mat-checkbox 
                [(ngModel)]="project.options.useAutoMapper"
                (ngModelChange)="onOptionsChange()"
              >
                <div class="option-item">
                  <strong>AutoMapper</strong>
                  <small>Object-to-object mapping</small>
                </div>
              </mat-checkbox>

              <mat-checkbox 
                [(ngModel)]="project.options.useMediatR"
                (ngModelChange)="onOptionsChange()"
              >
                <div class="option-item">
                  <strong>MediatR</strong>
                  <small>Mediator pattern implementation</small>
                </div>
              </mat-checkbox>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Database Configuration -->
        <mat-card class="settings-section">
          <mat-card-header>
            <mat-card-title>Database Configuration</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Database Provider</mat-label>
              <mat-select 
                [(ngModel)]="project.options.database"
                (ngModelChange)="onOptionsChange()"
              >
                <mat-option value="EntityFramework">Entity Framework Core</mat-option>
                <mat-option value="Dapper">Dapper</mat-option>
                <mat-option value="MongoDB">MongoDB</mat-option>
                <mat-option value="InMemory">In-Memory (Testing)</mat-option>
              </mat-select>
              <mat-hint>Choose your preferred data access technology</mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Authentication Configuration -->
        <mat-card class="settings-section">
          <mat-card-header>
            <mat-card-title>Authentication</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Authentication Method</mat-label>
              <mat-select 
                [(ngModel)]="project.options.authentication"
                (ngModelChange)="onOptionsChange()"
              >
                <mat-option value="JWT">JWT (JSON Web Tokens)</mat-option>
                <mat-option value="Cookie">Cookie Authentication</mat-option>
                <mat-option value="OAuth">OAuth 2.0</mat-option>
                <mat-option value="IdentityServer">Identity Server</mat-option>
                <mat-option value="None">No Authentication</mat-option>
              </mat-select>
              <mat-hint>Select authentication strategy for your API</mat-hint>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Project Statistics -->
        <mat-card class="settings-section">
          <mat-card-header>
            <mat-card-title>Project Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon>view_module</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ entityCount }}</span>
                  <span class="stat-label">Entities</span>
                </div>
              </div>

              <div class="stat-item">
                <mat-icon>link</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ relationshipCount }}</span>
                  <span class="stat-label">Relationships</span>
                </div>
              </div>

              <div class="stat-item">
                <mat-icon>rule</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ validationCount }}</span>
                  <span class="stat-label">Validations</span>
                </div>
              </div>

              <div class="stat-item">
                <mat-icon>code</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ totalCommands }}</span>
                  <span class="stat-label">Commands</span>
                </div>
              </div>

              <div class="stat-item">
                <mat-icon>search</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ totalQueries }}</span>
                  <span class="stat-label">Queries</span>
                </div>
              </div>

              <div class="stat-item">
                <mat-icon>storage</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ totalProperties }}</span>
                  <span class="stat-label">Properties</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Validation Results -->
        <mat-card class="settings-section" *ngIf="validationResult">
          <mat-card-header>
            <mat-card-title>
              <mat-icon [color]="validationResult.isValid ? 'primary' : 'warn'">
                {{ validationResult.isValid ? 'check_circle' : 'error' }}
              </mat-icon>
              Validation Results
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="validationResult.isValid" class="validation-success">
              <p>✅ Project configuration is valid and ready for generation!</p>
            </div>
            
            <div *ngIf="!validationResult.isValid" class="validation-errors">
              <h4>Errors:</h4>
              <ul>
                <li *ngFor="let error of validationResult.errors" class="error-item">
                  {{ error }}
                </li>
              </ul>
            </div>

            <div *ngIf="validationResult.warnings.length > 0" class="validation-warnings">
              <h4>Warnings:</h4>
              <ul>
                <li *ngFor="let warning of validationResult.warnings" class="warning-item">
                  {{ warning }}
                </li>
              </ul>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions -->
        <div class="panel-actions">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="validateProject()"
            [disabled]="isValidating"
          >
            <mat-icon>check</mat-icon>
            {{ isValidating ? 'Validating...' : 'Validate Project' }}
          </button>

          <button 
            mat-stroked-button 
            (click)="resetProject()"
          >
            <mat-icon>refresh</mat-icon>
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./project-panel.component.scss']
})
export class ProjectPanelComponent implements OnInit {
  project: ProjectMetadata;
  validationResult: ValidationResult | null = null;
  isValidating = false;

  entityCount = 0;
  relationshipCount = 0;
  validationCount = 0;
  totalCommands = 0;
  totalQueries = 0;
  totalProperties = 0;

  constructor(
    private projectState: ProjectStateService,
    private projectGenerator: ProjectGeneratorService
  ) {
    this.project = this.projectState.getProject();
  }

  ngOnInit() {
    this.projectState.project$.subscribe(project => {
      this.project = project;
      this.updateStatistics();
    });

    this.projectState.relationships$.subscribe(relationships => {
      this.relationshipCount = relationships.length;
    });

    this.projectState.validationRules$.subscribe(validations => {
      this.validationCount = validations.length;
    });
  }

  onProjectNameChange() {
    this.projectState.updateProjectName(this.project.projectName);
  }

  onOptionsChange() {
    this.projectState.updateProject(this.project);
  }

  updateStatistics() {
    this.entityCount = this.project.entities.length;
    this.totalCommands = this.project.entities.reduce((sum, entity) => sum + entity.commands.length, 0);
    this.totalQueries = this.project.entities.reduce((sum, entity) => sum + entity.queries.length, 0);
    this.totalProperties = this.project.entities.reduce((sum, entity) => sum + entity.properties.length, 0);
  }

  validateProject() {
    this.isValidating = true;
    this.projectGenerator.validateMetadata(this.project).subscribe({
      next: (result) => {
        this.validationResult = result;
        this.isValidating = false;
      },
      error: (error) => {
        console.error('Validation failed:', error);
        this.isValidating = false;
      }
    });
  }

  resetProject() {
    const confirmed = confirm('Are you sure you want to reset the project to default settings? This will remove all entities, relationships, and validations.');
    if (confirmed) {
      this.projectState.updateProject(this.projectState.createEmptyProject());
      this.validationResult = null;
    }
  }
}
