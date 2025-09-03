import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AccountTier } from '../../../common/models/account-tier.model';
import { IconSelectorComponent } from '../../shared/icon-selector/icon-selector.component';

@Component({
  selector: 'app-tier-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, 
    InputNumberModule, CheckboxModule, ToggleSwitchModule, IconSelectorComponent
  ],
  templateUrl: './tier-dialog.component.html',
  styleUrls: ['./tier-dialog.component.css']
})
export class TierDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  tier: AccountTier | null = this.config.data?.tier || null;
  isEditMode = !!this.tier;
  form: FormGroup;

  // Custom icon categories for tiers


  constructor() {
    this.form = this.fb.group({
      // Basic Info
      name: ['', Validators.required],
      tierKey: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      period: ['לחודש', Validators.required],
      audience: [''],
      displayOrder: [0, Validators.required],
      icon: ['pi pi-star'],
      isActive: [true],
      isPopular: [false],
      
      // Limits
      limit_users: [1, Validators.required],
      limit_suppliers: [3, Validators.required],
      limit_history_days: [7, Validators.required],

      // Features
      can_export_excel: [false],
      can_manage_roles: [false],
      can_use_ai_insights: [false],
      can_import_from_text: [false],

      // Service Levels (Not in form, but part of the model)
      dashboard_level: ['basic', Validators.required],
      support_level: ['community', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.tier) {
      this.form.patchValue(this.tier);
    }
  }

  onIconChange(icon: string): void {
    console.log('Icon changed to:', icon);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.value);
  }

  onCancel(): void {
    this.ref.close(null);
  }
}