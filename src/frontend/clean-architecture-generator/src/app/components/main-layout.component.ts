import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectPanelComponent } from './panels/project-panel.component';
import { EntitiesPanelComponent } from './panels/entities-panel.component';
import { RelationshipsPanelComponent } from './panels/relationships-panel.component';
import { ValidationsPanelComponent } from './panels/validations-panel.component';
import { FlowchartCanvasComponent } from './flowchart-canvas.component';

import { ProjectStateService } from '../services/project-state.service';
import { ProjectGeneratorService } from '../services/project-generator.service';

export type MenuSection = 'project' | 'entities' | 'relationships' | 'validations';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatSnackBarModule,
    ProjectPanelComponent,
    EntitiesPanelComponent,
    RelationshipsPanelComponent,
    ValidationsPanelComponent,
    FlowchartCanvasComponent
  ],
  template: `
    <div class="designer-layout">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <mat-icon class="app-icon">architecture</mat-icon>
          <h1 class="app-title">Clean Architecture Designer</h1>
        </div>

        <div class="header-actions">
          <button mat-icon-button [matMenuTriggerFor]="fileMenu" class="header-btn">
            <mat-icon>folder</mat-icon>
          </button>
          <mat-menu #fileMenu="matMenu">
            <button mat-menu-item (click)="newProject()">
              <mat-icon>add</mat-icon>
              <span>New Project</span>
            </button>
            <button mat-menu-item (click)="saveProject()">
              <mat-icon>save</mat-icon>
              <span>Save Project</span>
            </button>
            <button mat-menu-item (click)="loadProject()">
              <mat-icon>folder_open</mat-icon>
              <span>Load Project</span>
            </button>
          </mat-menu>

          <button
            mat-raised-button
            color="primary"
            (click)="generateProject()"
            [disabled]="isGenerating"
            class="generate-btn"
          >
            <mat-icon>build</mat-icon>
            {{ isGenerating ? 'Generating...' : 'Generate Project' }}
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Left Navigation -->
        <nav class="left-nav">
          <div class="nav-header">
            <h3>Designer Tools</h3>
          </div>

          <div class="nav-menu">
            <button
              class="nav-item"
              [class.active]="activeSection === 'project'"
              (click)="selectMenuSection('project')"
            >
              <mat-icon>settings</mat-icon>
              <span>Project Settings</span>
            </button>

            <button
              class="nav-item"
              [class.active]="activeSection === 'entities'"
              (click)="selectMenuSection('entities')"
            >
              <mat-icon>view_module</mat-icon>
              <span>Entities</span>
              <span class="count-badge" *ngIf="entityCount > 0">{{ entityCount }}</span>
            </button>

            <button
              class="nav-item"
              [class.active]="activeSection === 'relationships'"
              (click)="selectMenuSection('relationships')"
            >
              <mat-icon>link</mat-icon>
              <span>Relationships</span>
              <span class="count-badge" *ngIf="relationshipCount > 0">{{ relationshipCount }}</span>
            </button>

            <button
              class="nav-item"
              [class.active]="activeSection === 'validations'"
              (click)="selectMenuSection('validations')"
            >
              <mat-icon>rule</mat-icon>
              <span>Validations</span>
              <span class="count-badge" *ngIf="validationCount > 0">{{ validationCount }}</span>
            </button>
          </div>

          <div class="quick-actions">
            <h4>Quick Add</h4>
            <button mat-stroked-button (click)="addEntity()" class="quick-btn">
              <mat-icon>add</mat-icon>
              Entity
            </button>
          </div>
        </nav>

        <!-- Content Panels -->
        <div class="content-panels">
          <!-- Right Panel for Selected Menu -->
          <div class="right-panel">
            <app-project-panel
              *ngIf="activeSection === 'project'"
              class="panel-content">
            </app-project-panel>

            <app-entities-panel
              *ngIf="activeSection === 'entities'"
              class="panel-content">
            </app-entities-panel>

            <app-relationships-panel
              *ngIf="activeSection === 'relationships'"
              class="panel-content">
            </app-relationships-panel>

            <app-validations-panel
              *ngIf="activeSection === 'validations'"
              class="panel-content">
            </app-validations-panel>
          </div>

          <!-- Canvas Area -->
          <div class="canvas-area">
            <app-flowchart-canvas></app-flowchart-canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  activeSection: MenuSection = 'project';
  isGenerating = false;

  entityCount = 0;
  relationshipCount = 0;
  validationCount = 0;

  constructor(
    private projectState: ProjectStateService,
    private projectGenerator: ProjectGeneratorService
  ) {}

  ngOnInit() {
    // Subscribe to project changes to update counts
    this.projectState.project$.subscribe(project => {
      this.entityCount = project.entities.length;
    });

    this.projectState.relationships$.subscribe(relationships => {
      this.relationshipCount = relationships.length;
    });

    this.projectState.validationRules$.subscribe(validations => {
      this.validationCount = validations.length;
    });
  }

  selectMenuSection(section: MenuSection) {
    this.activeSection = section;
  }

  // File Operations
  newProject() {
    this.projectState.updateProject(this.projectState.createEmptyProject());
    this.activeSection = 'project';
  }

  saveProject() {
    const project = this.projectState.getProject();
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.projectName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const project = JSON.parse(e.target.result);
            this.projectState.updateProject(project);
            this.activeSection = 'project';
          } catch (error) {
            console.error('Error loading project:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  exportProject() {
    this.saveProject(); // Same as save for now
  }

  generateProject() {
    this.isGenerating = true;
    const project = this.projectState.getProject();

    this.projectGenerator.generateProject(project).subscribe({
      next: (blob) => {
        this.projectGenerator.downloadFile(blob, `${project.projectName}.zip`);
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Generation failed:', error);
        this.isGenerating = false;
      }
    });
  }

  // Quick Actions
  addEntity() {
    this.activeSection = 'entities';
    // The entities panel will handle the actual creation
  }

  addRelationship() {
    this.activeSection = 'relationships';
    // The relationships panel will handle the actual creation
  }

  addValidation() {
    this.activeSection = 'validations';
    // The validations panel will handle the actual creation
  }
}
