import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-relationships-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="relationships-panel">
      <div class="panel-header">
        <h2>
          <mat-icon>link</mat-icon>
          Relationships
        </h2>
        <p>Define relationships between your entities.</p>
      </div>
      <div class="panel-content">
        <mat-card>
          <mat-card-content>
            <div class="coming-soon">
              <mat-icon>construction</mat-icon>
              <h3>Coming Soon</h3>
              <p>Relationship management will be available in the next update.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .relationships-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      padding: 24px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }
    .panel-header h2 {
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 500;
    }
    .panel-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .panel-content {
      flex: 1;
      padding: 24px;
    }
    .coming-soon {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .coming-soon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class RelationshipsPanelComponent {}
