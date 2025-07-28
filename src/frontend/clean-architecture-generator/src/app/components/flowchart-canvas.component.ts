import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectStateService } from '../services/project-state.service';
import { EntityMetadata, Position } from '../models/project.models';

@Component({
  selector: 'app-flowchart-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container" #canvasContainer (click)="onCanvasClick($event)">
      <!-- Entity Nodes -->
      <div
        class="entity-node"
        *ngFor="let entity of entities"
        [style.left.px]="entity.position.x"
        [style.top.px]="entity.position.y"
        [style.border-color]="entity.color"
        [class.selected]="selectedEntity?.id === entity.id"
        (click)="selectEntity(entity, $event)"
        (mousedown)="startDrag(entity, $event)"
      >
        <div class="entity-header" [style.background-color]="entity.color + '20'">
          <h3>{{ entity.name }}</h3>
          <span class="entity-type">Entity</span>
        </div>
        <div class="entity-properties">
          <div class="property" *ngFor="let prop of entity.properties.slice(0, 5)">
            <span class="property-name">{{ prop.name }}</span>
            <span class="property-type">{{ prop.type }}</span>
            <span class="property-key" *ngIf="prop.isKey">🔑</span>
          </div>
          <div class="more-properties" *ngIf="entity.properties.length > 5">
            +{{ entity.properties.length - 5 }} more...
          </div>
        </div>
        <div class="entity-footer">
          <span class="commands-count">{{ entity.commands.length }} commands</span>
          <span class="queries-count">{{ entity.queries.length }} queries</span>
        </div>
      </div>

      <!-- Grid Background -->
      <div class="grid-background"></div>
    </div>
  `,
  styles: [`
    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: auto;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      cursor: default;
    }

    .grid-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.4) 1px, transparent 0);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 0;
    }

    .entity-node {
      position: absolute;
      width: 300px;
      min-height: 200px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      cursor: move;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
      overflow: hidden;
    }

    .entity-node:hover {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
      border-color: #cbd5e1;
    }

    .entity-node.selected {
      border-color: #667eea;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
      transform: translateY(-4px);
    }

    .entity-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      border-radius: 14px 14px 0 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }

    .entity-header h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.025em;
    }

    .entity-type {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }

    .entity-properties {
      padding: 16px 20px;
      max-height: 140px;
      overflow-y: auto;
    }

    .property {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .property:last-child {
      border-bottom: none;
    }

    .property-name {
      font-weight: 600;
      color: #1e293b;
      flex: 1;
      font-size: 14px;
    }

    .property-type {
      color: #64748b;
      font-size: 11px;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 6px;
      margin-right: 8px;
      font-weight: 500;
      border: 1px solid #e2e8f0;
    }

    .property-key {
      font-size: 14px;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    .more-properties {
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      padding: 12px 0;
      font-style: italic;
      font-weight: 500;
    }

    .entity-footer {
      padding: 12px 20px;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      border-radius: 0 0 14px 14px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .entity-node {
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class FlowchartCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;

  entities: EntityMetadata[] = [];
  selectedEntity: EntityMetadata | null = null;

  private isDragging = false;
  private dragEntity: EntityMetadata | null = null;
  private dragOffset = { x: 0, y: 0 };

  constructor(private projectState: ProjectStateService) {}

  ngOnInit() {
    this.projectState.project$.subscribe(project => {
      this.entities = project.entities;
    });

    this.projectState.selectedEntity$.subscribe(entity => {
      this.selectedEntity = entity;
    });
  }

  ngAfterViewInit() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  selectEntity(entity: EntityMetadata, event: Event) {
    event.stopPropagation();
    this.projectState.selectEntity(entity);
  }

  onCanvasClick(event: MouseEvent) {
    this.projectState.selectEntity(null);
  }

  startDrag(entity: EntityMetadata, event: MouseEvent) {
    event.stopPropagation();
    this.isDragging = true;
    this.dragEntity = entity;

    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left - entity.position.x,
      y: event.clientY - rect.top - entity.position.y
    };
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.dragEntity) {
      const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
      const newPosition: Position = {
        x: Math.max(0, event.clientX - rect.left - this.dragOffset.x),
        y: Math.max(0, event.clientY - rect.top - this.dragOffset.y)
      };

      this.projectState.updateEntity(this.dragEntity.id, { position: newPosition });
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragEntity = null;
  }
}
