import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MarkdownToHtmlPipe } from "../../../pipes/markdown-to-html.pipe";

export interface ConfirmationData {
  message: string;
  icon?: string;
  header?: string;
  title?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonClass?: string;
  rejectButtonClass?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, MarkdownToHtmlPipe],
  template: `
    <div class="confirmation-dialog no-header">
      <div class="dialog-header">
        <!-- <h3 class="header-title">{{ title }}</h3> -->
        <i [ngClass]="icon" class="header-icon"></i>
      </div>
            <p class="dialog-message" [innerHTML]="message | markdownToHtml"></p>
      <div class="dialog-actions">
        <button class="primary md" (click)="reject()">
          <span class="material-symbols-rounded">cancel</span>
          {{rejectLabel}}
        </button>
        <button class="danger md" (click)="accept()">
          <span class="material-symbols-rounded">delete</span>
          {{acceptLabel}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.5rem;
      padding: 1rem;
    }
    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .header-icon {
      font-size: 3rem;
      color: var(--primary-500);
    }
    .header-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }
    .dialog-message {
      font-size: 1rem;
      color: var(--grey-700);
      line-height: 1.5;
      margin: 0;
    }
    .dialog-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      width: 100%;
    }
  `]
})
export class ConfirmationDialogComponent {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  message: string;
  icon: string;
  // header: string;
  title:string;
  acceptLabel: string;
  rejectLabel: string;
  acceptButtonClass: string;
  rejectButtonClass: string;

  constructor() {
    const data: ConfirmationData = this.config.data || {};
    this.message = data.message || 'האם אתה בטוח?';
    this.icon = data.icon || 'pi pi-exclamation-triangle';
    // this.header = data.header || 'אישור פעולה';
    this.title = data.title || 'אישור פעולה';
    this.acceptLabel = data.acceptLabel || 'אישור';
    this.rejectLabel = data.rejectLabel || 'ביטול';
    this.acceptButtonClass = data.acceptButtonClass || 'p-button-danger';
    this.rejectButtonClass = data.rejectButtonClass || 'p-button-text';
  }

  accept(): void {
    this.ref.close(true);
  }

  reject(): void {
    this.ref.close(false);
  }
}