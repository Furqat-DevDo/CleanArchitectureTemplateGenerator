import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectStateService } from '../services/project-state.service';
import { ProjectGeneratorService } from '../services/project-generator.service';
import { EntityMetadata, Position, ProjectMetadata } from '../models/project.models';

@Component({
  selector: 'app-flowchart-designer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="designer-container">
      <!-- Toolbar -->
      <mat-toolbar color="primary" class="designer-toolbar">
        <span>Clean Architecture Designer</span>
        
        <div class="toolbar-spacer"></div>
        
        <button mat-icon-button [matMenuTriggerFor]="fileMenu">
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

        <button mat-icon-button [matMenuTriggerFor]="addMenu">
          <mat-icon>add_circle</mat-icon>
        </button>
        <mat-menu #addMenu="matMenu">
          <button mat-menu-item (click)="addEntity()">
            <mat-icon>view_module</mat-icon>
            <span>Add Entity</span>
          </button>
          <button mat-menu-item (click)="addRelationship()">
            <mat-icon>link</mat-icon>
            <span>Add Relationship</span>
          </button>
          <button mat-menu-item (click)="addValidation()">
            <mat-icon>rule</mat-icon>
            <span>Add Validation</span>
          </button>
        </mat-menu>

        <button mat-raised-button color="accent" (click)="generateProject()" [disabled]="isGenerating">
          <mat-icon>build</mat-icon>
          {{ isGenerating ? 'Generating...' : 'Generate Project' }}
        </button>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="designer-content">
        <!-- Side Panel -->
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav mode="side" opened class="side-panel">
            <div class="panel-content">
              <!-- Project Settings -->
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>Project Settings</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Project Name</mat-label>
                    <input matInput [(ngModel)]="project.projectName" placeholder="Enter project name">
                  </mat-form-field>

                  <div class="options-section">
                    <h4>Generation Options</h4>
                    <mat-checkbox [(ngModel)]="project.options.useFluentValidation">
                      Use FluentValidation
                    </mat-checkbox>
                    <mat-checkbox [(ngModel)]="project.options.useAutoMapper">
                      Use AutoMapper
                    </mat-checkbox>
                    <mat-checkbox [(ngModel)]="project.options.useMediatR">
                      Use MediatR
                    </mat-checkbox>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Database</mat-label>
                    <mat-select [(ngModel)]="project.options.database">
                      <mat-option value="EntityFramework">Entity Framework</mat-option>
                      <mat-option value="Dapper">Dapper</mat-option>
                      <mat-option value="MongoDB">MongoDB</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Authentication</mat-label>
                    <mat-select [(ngModel)]="project.options.authentication">
                      <mat-option value="JWT">JWT</mat-option>
                      <mat-option value="Cookie">Cookie</mat-option>
                      <mat-option value="OAuth">OAuth</mat-option>
                    </mat-select>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>

              <!-- Entity Details -->
              <mat-card class="entity-details-card" *ngIf="selectedEntity">
                <mat-card-header>
                  <mat-card-title>{{ selectedEntity.name }} Details</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Entity Name</mat-label>
                    <input matInput [(ngModel)]="selectedEntity.name" placeholder="Enter entity name">
                  </mat-form-field>

                  <div class="properties-section">
                    <h4>Properties</h4>
                    <div class="property-item" *ngFor="let property of selectedEntity.properties">
                      <div class="property-row">
                        <mat-form-field appearance="outline" class="property-name">
                          <mat-label>Name</mat-label>
                          <input matInput [(ngModel)]="property.name">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="property-type">
                          <mat-label>Type</mat-label>
                          <mat-select [(ngModel)]="property.type">
                            <mat-option value="string">string</mat-option>
                            <mat-option value="int">int</mat-option>
                            <mat-option value="Guid">Guid</mat-option>
                            <mat-option value="decimal">decimal</mat-option>
                            <mat-option value="DateTime">DateTime</mat-option>
                            <mat-option value="bool">bool</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <button mat-icon-button color="warn" (click)="deleteProperty(property.id)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                      <div class="property-options">
                        <mat-checkbox [(ngModel)]="property.isKey">Key</mat-checkbox>
                        <mat-checkbox [(ngModel)]="property.required">Required</mat-checkbox>
                      </div>
                    </div>
                    <button mat-stroked-button (click)="addProperty()" class="add-property-btn">
                      <mat-icon>add</mat-icon>
                      Add Property
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-sidenav>

          <!-- Canvas Area -->
          <mat-sidenav-content class="canvas-container">
            <div class="canvas-area" #canvasArea (click)="onCanvasClick($event)">
              <!-- Entity Nodes -->
              <div 
                class="entity-node" 
                *ngFor="let entity of project.entities"
                [style.left.px]="entity.position.x"
                [style.top.px]="entity.position.y"
                [style.background-color]="entity.color"
                [class.selected]="selectedEntity?.id === entity.id"
                (click)="selectEntity(entity, $event)"
                (mousedown)="startDrag(entity, $event)"
              >
                <div class="entity-header">
                  <h3>{{ entity.name }}</h3>
                  <button mat-icon-button class="delete-btn" (click)="deleteEntity(entity.id, $event)">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="entity-properties">
                  <div class="property" *ngFor="let prop of entity.properties">
                    <span class="property-name">{{ prop.name }}</span>
                    <span class="property-type">{{ prop.type }}</span>
                    <mat-icon *ngIf="prop.isKey" class="key-icon">vpn_key</mat-icon>
                  </div>
                </div>
                <div class="entity-operations">
                  <div class="commands">
                    <small>Commands: {{ entity.commands.length }}</small>
                  </div>
                  <div class="queries">
                    <small>Queries: {{ entity.queries.length }}</small>
                  </div>
                </div>
              </div>

              <!-- Relationship Lines -->
              <svg class="relationships-svg" *ngIf="relationships.length > 0">
                <line 
                  *ngFor="let rel of relationships"
                  [attr.x1]="getEntityCenter(rel.fromEntityId).x"
                  [attr.y1]="getEntityCenter(rel.fromEntityId).y"
                  [attr.x2]="getEntityCenter(rel.toEntityId).x"
                  [attr.y2]="getEntityCenter(rel.toEntityId).y"
                  stroke="#666"
                  stroke-width="2"
                  marker-end="url(#arrowhead)"
                />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                          refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                  </marker>
                </defs>
              </svg>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    </div>
  `,
  styleUrls: ['./flowchart-designer.component.scss']
})
export class FlowchartDesignerComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasArea') canvasArea!: ElementRef;

  project: ProjectMetadata;
  selectedEntity: EntityMetadata | null = null;
  relationships: any[] = [];
  isGenerating = false;
  
  private isDragging = false;
  private dragEntity: EntityMetadata | null = null;
  private dragOffset = { x: 0, y: 0 };

  constructor(
    private projectState: ProjectStateService,
    private projectGenerator: ProjectGeneratorService
  ) {
    this.project = this.projectState.getProject();
  }

  ngOnInit() {
    this.projectState.project$.subscribe(project => {
      this.project = project;
    });

    this.projectState.selectedEntity$.subscribe(entity => {
      this.selectedEntity = entity;
    });

    this.projectState.relationships$.subscribe(relationships => {
      this.relationships = relationships;
    });
  }

  ngAfterViewInit() {
    // Setup canvas event listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  // Entity Management
  addEntity() {
    const position: Position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };
    const entity = this.projectState.addEntity(`Entity${this.project.entities.length + 1}`, position);
    this.selectEntity(entity);
  }

  selectEntity(entity: EntityMetadata, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.projectState.selectEntity(entity);
  }

  deleteEntity(entityId: string, event: Event) {
    event.stopPropagation();
    this.projectState.deleteEntity(entityId);
  }

  // Property Management
  addProperty() {
    if (this.selectedEntity) {
      this.projectState.addProperty(this.selectedEntity.id, {
        name: 'NewProperty',
        type: 'string',
        isKey: false,
        required: false
      });
    }
  }

  deleteProperty(propertyId: string) {
    if (this.selectedEntity) {
      this.projectState.deleteProperty(this.selectedEntity.id, propertyId);
    }
  }

  // Canvas Events
  onCanvasClick(event: MouseEvent) {
    this.projectState.selectEntity(null);
  }

  // Drag and Drop
  startDrag(entity: EntityMetadata, event: MouseEvent) {
    event.stopPropagation();
    this.isDragging = true;
    this.dragEntity = entity;
    
    const rect = this.canvasArea.nativeElement.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left - entity.position.x,
      y: event.clientY - rect.top - entity.position.y
    };
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.dragEntity) {
      const rect = this.canvasArea.nativeElement.getBoundingClientRect();
      const newPosition: Position = {
        x: event.clientX - rect.left - this.dragOffset.x,
        y: event.clientY - rect.top - this.dragOffset.y
      };
      
      this.projectState.updateEntity(this.dragEntity.id, { position: newPosition });
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragEntity = null;
  }

  // Project Actions
  newProject() {
    this.projectState.updateProject(this.projectState.createEmptyProject());
  }

  saveProject() {
    const dataStr = JSON.stringify(this.project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.project.projectName}.json`;
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
          } catch (error) {
            console.error('Error loading project:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  generateProject() {
    this.isGenerating = true;
    this.projectGenerator.generateProject(this.project).subscribe({
      next: (blob) => {
        this.projectGenerator.downloadFile(blob, `${this.project.projectName}.zip`);
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Generation failed:', error);
        this.isGenerating = false;
      }
    });
  }

  // Utility Methods
  addRelationship() {
    // TODO: Implement relationship creation dialog
    console.log('Add relationship clicked');
  }

  addValidation() {
    // TODO: Implement validation rule creation dialog
    console.log('Add validation clicked');
  }

  getEntityCenter(entityId: string): Position {
    const entity = this.project.entities.find(e => e.id === entityId);
    if (entity) {
      return {
        x: entity.position.x + 150, // Half of entity width
        y: entity.position.y + 100  // Half of entity height
      };
    }
    return { x: 0, y: 0 };
  }
}
