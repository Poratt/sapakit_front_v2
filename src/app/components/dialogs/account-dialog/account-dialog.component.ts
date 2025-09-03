import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { Account } from '../../../common/models/account';
import { AccountTierData } from '../../../common/enums/account-tier.enums';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, SelectButtonModule],
  templateUrl: './account-dialog.component.html',
})
export class AccountDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  account: Account = this.config.data.account;
  accountTierData = AccountTierData;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      tier: [this.account.tier, Validators.required]
    });
  }

  onSave(): void {
    if (this.form.invalid) return;

    this.apiService.updateAccount(this.account.id, this.form.value).subscribe({
      next: (response) => {
        if (response.success && response.result) {
          this.notificationService.toast({ severity: 'success', detail: 'התוכנית עודכנה בהצלחה' });
          this.ref.close(response.result);
        } else {
          this.notificationService.toast({ severity: 'error', detail: response.message });
        }
      },
      error: (err) => this.notificationService.handleError(err)
    });
  }

  onCancel(): void {
    this.ref.close(null);
  }
}