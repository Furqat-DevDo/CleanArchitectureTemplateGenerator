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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProjectStateService } from '../../services/project-state.service';
import { EntityMetadata, PropertyMetadata, PROPERTY_TYPES, Position } from '../../models/project.models';

@Component({
  selector: 'app-entities-panel',
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
    MatDividerModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="entities-panel">
      <div class="panel-header">
        <h2>
          <mat-icon>view_module</mat-icon>
          Entities
        </h2>
        <p>Manage your domain entities, properties, commands, and queries.</p>
      </div>

      <div class="panel-content">
        <!-- Add New Entity -->
        <mat-card class="add-entity-card">
          <mat-card-header>
            <mat-card-title>Add New Entity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="add-entity-form">
              <mat-form-field appearance="outline" class="entity-name-field">
                <mat-label>Entity Name</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="newEntityName" 
                  placeholder="e.g., Product, Customer, Order"
                  (keyup.enter)="addEntity()"
                >
              </mat-form-field>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="addEntity()"
                [disabled]="!newEntityName.trim()"
              >
                <mat-icon>add</mat-icon>
                Add Entity
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Entities List -->
        <div class="entities-list" *ngIf="entities.length > 0">
          <mat-accordion>
            <mat-expansion-panel 
              *ngFor="let entity of entities; trackBy: trackByEntityId"
              [expanded]="selectedEntity?.id === entity.id"
              (opened)="selectEntity(entity)"
              class="entity-panel"
            >
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="entity-header">
                    <div class="entity-color" [style.background-color]="entity.color"></div>
                    <span class="entity-name">{{ entity.name }}</span>
                    <div class="entity-stats">
                      <mat-chip-set>
                        <mat-chip>{{ entity.properties.length }} props</mat-chip>
                        <mat-chip>{{ entity.commands.length }} cmds</mat-chip>
                        <mat-chip>{{ entity.queries.length }} queries</mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="entity-details">
                <!-- Entity Name -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Entity Name</mat-label>
                  <input 
                    matInput 
                    [(ngModel)]="entity.name"
                    (ngModelChange)="updateEntity(entity)"
                  >
                </mat-form-field>

                <!-- Properties Section -->
                <div class="properties-section">
                  <div class="section-header">
                    <h4>Properties</h4>
                    <button 
                      mat-icon-button 
                      color="primary" 
                      (click)="addProperty(entity)"
                      matTooltip="Add Property"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>

                  <div class="properties-list">
                    <div 
                      *ngFor="let property of entity.properties; trackBy: trackByPropertyId" 
                      class="property-item"
                    >
                      <div class="property-row">
                        <mat-form-field appearance="outline" class="property-name">
                          <mat-label>Name</mat-label>
                          <input 
                            matInput 
                            [(ngModel)]="property.name"
                            (ngModelChange)="updateProperty(entity, property)"
                          >
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="property-type">
                          <mat-label>Type</mat-label>
                          <mat-select 
                            [(ngModel)]="property.type"
                            (ngModelChange)="updateProperty(entity, property)"
                          >
                            <mat-option *ngFor="let type of propertyTypes" [value]="type">
                              {{ type }}
                            </mat-option>
                          </mat-select>
                        </mat-form-field>

                        <button 
                          mat-icon-button 
                          color="warn" 
                          (click)="deleteProperty(entity, property.id)"
                          matTooltip="Delete Property"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>

                      <div class="property-options">
                        <mat-checkbox 
                          [(ngModel)]="property.isKey"
                          (ngModelChange)="updateProperty(entity, property)"
                        >
                          Primary Key
                        </mat-checkbox>
                        <mat-checkbox 
                          [(ngModel)]="property.required"
                          (ngModelChange)="updateProperty(entity, property)"
                        >
                          Required
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Commands Section -->
                <div class="commands-section">
                  <div class="section-header">
                    <h4>Commands</h4>
                    <button 
                      mat-icon-button 
                      color="primary" 
                      (click)="addCommand(entity)"
                      matTooltip="Add Command"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>

                  <div class="commands-list">
                    <mat-chip-set>
                      <mat-chip 
                        *ngFor="let command of entity.commands"
                        [removable]="true"
                        (removed)="deleteCommand(entity, command.id)"
                      >
                        {{ command.name }}
                        <mat-icon matChipRemove>cancel</mat-icon>
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>

                <!-- Queries Section -->
                <div class="queries-section">
                  <div class="section-header">
                    <h4>Queries</h4>
                    <button 
                      mat-icon-button 
                      color="primary" 
                      (click)="addQuery(entity)"
                      matTooltip="Add Query"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>

                  <div class="queries-list">
                    <mat-chip-set>
                      <mat-chip 
                        *ngFor="let query of entity.queries"
                        [removable]="true"
                        (removed)="deleteQuery(entity, query.id)"
                      >
                        {{ query.name }}
                        <mat-icon matChipRemove>cancel</mat-icon>
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>

                <!-- Entity Actions -->
                <div class="entity-actions">
                  <button 
                    mat-stroked-button 
                    color="warn" 
                    (click)="deleteEntity(entity.id)"
                  >
                    <mat-icon>delete</mat-icon>
                    Delete Entity
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="entities.length === 0">
          <mat-icon>view_module</mat-icon>
          <h3>No Entities Yet</h3>
          <p>Start by adding your first domain entity above.</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./entities-panel.component.scss']
})
export class EntitiesPanelComponent implements OnInit {
  entities: EntityMetadata[] = [];
  selectedEntity: EntityMetadata | null = null;
  newEntityName = '';
  propertyTypes = PROPERTY_TYPES;

  constructor(private projectState: ProjectStateService) {}

  ngOnInit() {
    this.projectState.project$.subscribe(project => {
      this.entities = project.entities;
    });

    this.projectState.selectedEntity$.subscribe(entity => {
      this.selectedEntity = entity;
    });
  }

  addEntity() {
    if (this.newEntityName.trim()) {
      const position: Position = { 
        x: 100 + Math.random() * 300, 
        y: 100 + Math.random() * 300 
      };
      const entity = this.projectState.addEntity(this.newEntityName.trim(), position);
      this.selectEntity(entity);
      this.newEntityName = '';
    }
  }

  selectEntity(entity: EntityMetadata) {
    this.projectState.selectEntity(entity);
  }

  updateEntity(entity: EntityMetadata) {
    this.projectState.updateEntity(entity.id, { name: entity.name });
  }

  deleteEntity(entityId: string) {
    const confirmed = confirm('Are you sure you want to delete this entity? This will also remove all related relationships and validations.');
    if (confirmed) {
      this.projectState.deleteEntity(entityId);
    }
  }

  addProperty(entity: EntityMetadata) {
    this.projectState.addProperty(entity.id, {
      name: 'NewProperty',
      type: 'string',
      isKey: false,
      required: false
    });
  }

  updateProperty(entity: EntityMetadata, property: PropertyMetadata) {
    this.projectState.updateProperty(entity.id, property.id, property);
  }

  deleteProperty(entity: EntityMetadata, propertyId: string) {
    this.projectState.deleteProperty(entity.id, propertyId);
  }

  addCommand(entity: EntityMetadata) {
    const commandName = prompt('Enter command name:', `Create${entity.name}`);
    if (commandName) {
      this.projectState.addCommand(entity.id, {
        name: commandName,
        type: 'create'
      });
    }
  }

  deleteCommand(entity: EntityMetadata, commandId: string) {
    this.projectState.deleteCommand(entity.id, commandId);
  }

  addQuery(entity: EntityMetadata) {
    const queryName = prompt('Enter query name:', `Get${entity.name}s`);
    if (queryName) {
      this.projectState.addQuery(entity.id, {
        name: queryName,
        type: 'list',
        resultType: `List<${entity.name}Dto>`
      });
    }
  }

  deleteQuery(entity: EntityMetadata, queryId: string) {
    this.projectState.deleteQuery(entity.id, queryId);
  }

  trackByEntityId(index: number, entity: EntityMetadata): string {
    return entity.id;
  }

  trackByPropertyId(index: number, property: PropertyMetadata): string {
    return property.id;
  }
}
