import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ProjectGeneratorService, GenerationProgress, GenerationJobStatus } from '../../services/project-generator.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

export interface GenerationProgressDialogData {
  jobId: string;
  projectName: string;
}

@Component({
  selector: 'app-generation-progress-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="progress-dialog">
      <div class="dialog-header">
        <mat-icon class="header-icon">build</mat-icon>
        <h2 mat-dialog-title>Generating Project</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="project-info">
          <h3>{{ data.projectName }}</h3>
          <p class="job-id">Job ID: {{ data.jobId }}</p>
        </div>

        <div class="progress-section">
          <div class="progress-info">
            <span class="current-step">{{ currentProgress?.currentStep || 'Initializing...' }}</span>
            <span class="progress-percentage">{{ Math.round(currentProgress?.percentageComplete || 0) }}%</span>
          </div>
          
          <mat-progress-bar 
            mode="determinate" 
            [value]="currentProgress?.percentageComplete || 0"
            class="progress-bar">
          </mat-progress-bar>
          
          <div class="step-info" *ngIf="currentProgress">
            <span>Step {{ currentProgress.completedSteps }} of {{ currentProgress.totalSteps }}</span>
          </div>
        </div>

        <div class="status-section" [ngSwitch]="jobStatus">
          <div *ngSwitchCase="'pending'" class="status pending">
            <mat-icon>schedule</mat-icon>
            <span>Queued for processing...</span>
          </div>
          
          <div *ngSwitchCase="'running'" class="status running">
            <mat-icon>settings</mat-icon>
            <span>Generation in progress...</span>
          </div>
          
          <div *ngSwitchCase="'completed'" class="status completed">
            <mat-icon>check_circle</mat-icon>
            <span>Generation completed successfully!</span>
          </div>
          
          <div *ngSwitchCase="'failed'" class="status failed">
            <mat-icon>error</mat-icon>
            <span>Generation failed</span>
          </div>
        </div>

        <div class="error-section" *ngIf="errorMessage">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <p class="error-message">{{ errorMessage }}</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()" 
          [disabled]="jobStatus === 'completed'"
          class="cancel-btn">
          {{ jobStatus === 'completed' ? 'Close' : 'Cancel' }}
        </button>
        
        <button 
          mat-raised-button 
          color="primary"
          (click)="onDownload()" 
          [disabled]="jobStatus !== 'completed'"
          class="download-btn">
          <mat-icon>download</mat-icon>
          Download Project
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .progress-dialog {
      width: 500px;
      max-width: 90vw;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 0 24px;
      
      .header-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #667eea;
      }
      
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .dialog-content {
      padding: 20px 24px;
    }

    .project-info {
      margin-bottom: 24px;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #334155;
      }
      
      .job-id {
        margin: 0;
        font-size: 12px;
        color: #64748b;
        font-family: monospace;
      }
    }

    .progress-section {
      margin-bottom: 24px;
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .current-step {
          font-weight: 500;
          color: #334155;
        }
        
        .progress-percentage {
          font-weight: 600;
          color: #667eea;
        }
      }
      
      .progress-bar {
        height: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
      }
      
      .step-info {
        font-size: 12px;
        color: #64748b;
        text-align: center;
      }
    }

    .status-section {
      margin-bottom: 16px;
      
      .status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 500;
        
        &.pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        &.running {
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        &.completed {
          background: #dcfce7;
          color: #166534;
        }
        
        &.failed {
          background: #fecaca;
          color: #dc2626;
        }
      }
    }

    .error-section {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      
      .error-icon {
        color: #ef4444;
        margin-top: 2px;
      }
      
      .error-message {
        margin: 0;
        color: #dc2626;
        font-size: 14px;
      }
    }

    .dialog-actions {
      padding: 16px 24px 24px 24px;
      gap: 12px;
      
      .cancel-btn {
        color: #64748b;
      }
      
      .download-btn {
        background: #10b981;
        
        &:hover:not(:disabled) {
          background: #059669;
        }
        
        &:disabled {
          background: #e2e8f0;
          color: #94a3b8;
        }
      }
    }
  `]
})
export class GenerationProgressDialogComponent implements OnInit, OnDestroy {
  currentProgress?: GenerationProgress;
  jobStatus: string = 'pending';
  errorMessage?: string;
  
  private progressSubscription?: Subscription;
  private statusSubscription?: Subscription;
  
  Math = Math; // Make Math available in template

  constructor(
    public dialogRef: MatDialogRef<GenerationProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenerationProgressDialogData,
    private projectGeneratorService: ProjectGeneratorService
  ) {}

  async ngOnInit() {
    // Start tracking the job
    await this.projectGeneratorService.trackJob(this.data.jobId);
    
    // Subscribe to progress updates
    this.progressSubscription = this.projectGeneratorService.getProgressUpdates()
      .subscribe(progress => {
        if (progress.jobId === this.data.jobId) {
          this.currentProgress = progress;
          
          if (progress.hasError) {
            this.jobStatus = 'failed';
            this.errorMessage = progress.errorMessage;
          } else if (progress.isCompleted) {
            this.jobStatus = 'completed';
          } else {
            this.jobStatus = 'running';
          }
        }
      });

    // Poll job status periodically
    this.statusSubscription = interval(2000)
      .pipe(
        switchMap(() => this.projectGeneratorService.getJobStatus(this.data.jobId)),
        takeWhile(status => status.status !== 'completed' && status.status !== 'failed', true)
      )
      .subscribe(status => {
        this.jobStatus = status.status;
        if (status.progress) {
          this.currentProgress = status.progress;
        }
      });
  }

  async ngOnDestroy() {
    // Stop tracking the job
    await this.projectGeneratorService.stopTrackingJob(this.data.jobId);
    
    // Unsubscribe from observables
    this.progressSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
  }

  onCancel() {
    this.dialogRef.close({ action: 'cancel' });
  }

  onDownload() {
    this.projectGeneratorService.downloadProject(this.data.jobId)
      .subscribe(blob => {
        const filename = `${this.data.projectName}_${new Date().toISOString().slice(0, 10)}.zip`;
        this.projectGeneratorService.downloadFile(blob, filename);
        this.dialogRef.close({ action: 'download', filename });
      });
  }
}
