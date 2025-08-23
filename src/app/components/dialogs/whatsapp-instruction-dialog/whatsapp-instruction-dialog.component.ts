// in whatsapp-instruction-dialog.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

export interface InstructionConfig {
  supplierName?: string;
  method: 'whatsapp' | 'clipboard' | 'failed';
  autoHide?: boolean;
  autoHideDelay?: number;
}

@Component({
  selector: 'app-whatsapp-instruction-dialog',
  standalone: true, // ודא שהקומפוננטה היא standalone
  imports: [CommonModule],
  styleUrls: ['./whatsapp-instruction-dialog.component.css'],
  templateUrl: './whatsapp-instruction-dialog.component.html',
  animations: [
    // האנימציות של PrimeNG יטפלו בזה, אבל אפשר להשאיר אם יש אנימציות פנימיות
    trigger('fadeIn', [ 
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class WhatsAppInstructionDialogComponent implements OnInit {
  // --- Injections for Dynamic Dialog ---
  private ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  
  // --- State ---
  public instructionConfig: InstructionConfig;
  private autoHideTimeout?: number;

  constructor() {
    // קבל את ה-config דרך ה-injector ולא דרך @Input
    this.instructionConfig = this.config.data || { method: 'failed' };
  }

  ngOnInit() {
    // הסתרה אוטומטית
    if (this.instructionConfig.autoHide && this.instructionConfig.method === 'whatsapp') {
      this.autoHideTimeout = window.setTimeout(() => {
        this.onClose();
      }, this.instructionConfig.autoHideDelay || 300);
    }
  }

  onClose() {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
    // סגור את הדיאלוג והחזר תוצאה 'close'
    this.ref.close('close');
  }

  onRetry() {
    // סגור את הדיאלוג והחזר תוצאה 'retry'
    this.ref.close('retry');
  }
}