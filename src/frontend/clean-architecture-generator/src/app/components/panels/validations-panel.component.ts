import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-validations-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="validations-panel">
      <div class="panel-header">
        <h2>
          <mat-icon>rule</mat-icon>
          Validations
        </h2>
        <p>Configure validation rules for your entities and properties.</p>
      </div>
      <div class="panel-content">
        <mat-card>
          <mat-card-content>
            <div class="coming-soon">
              <mat-icon>construction</mat-icon>
              <h3>Coming Soon</h3>
              <p>Validation rule management will be available in the next update.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .validations-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      padding: 24px;
      background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%);
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
export class ValidationsPanelComponent {}
