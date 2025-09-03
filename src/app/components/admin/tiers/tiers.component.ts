import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { PageStates } from '../../../common/models/pageStates';
import { AccountTier } from '../../../common/models/account-tier.model';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { fadeIn400 } from '../../../common/const/animations';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogConfigWide } from '../../../common/const/dialog-config';
import { TierDialogComponent } from '../../dialogs/tier-dialog/tier-dialog.component';
import { PricingPlansComponent } from "../pricing-plans/pricing-plans.component";

@Component({
  selector: 'app-tiers',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, LoaderComponent, ConfirmDialogModule, PricingPlansComponent],
  templateUrl: './tiers.component.html',
  styleUrls: ['./tiers.component.css'],
  providers: [DialogService],
  animations: [fadeIn400],
})
export class TiersComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  tiers = signal<AccountTier[]>([]);
  pageState = signal<PageStates>(PageStates.Loading);
  readonly PageStates = PageStates;

  ngOnInit() {
    this.loadTiers();
  }

  loadTiers() {
    this.pageState.set(PageStates.Loading);
    this.apiService.getAllTiers().subscribe({
      next: (response) => {
        if (response.success && response.result) {
          this.tiers.set(response.result);
          this.pageState.set(PageStates.Ready);
        } else {
          this.pageState.set(PageStates.Error);
          this.notificationService.toast({ severity: 'error', detail: response.message });
        }
      },
      error: (err) => {
        this.pageState.set(PageStates.Error);
        this.notificationService.handleError(err);
      }
    });
  }

editTier(tier: AccountTier) {
    const ref = this.dialogService.open(TierDialogComponent, {
        ...DialogConfigWide,
        header: `עריכת תוכנית: ${tier.name}`,
        data: { tier }
    });

    ref.onClose.subscribe((formData: Partial<AccountTier> | null) => {
        if (formData) {
            this.apiService.updateTier(tier.id, formData).subscribe({
                next: (res) => {
                    if (res.success && res.result) {
                        this.notificationService.toast({ severity: 'success', detail: 'התוכנית עודכנה בהצלחה.' });
                        this.tiers.update(current => 
                            current.map(t => t.id === res.result!.id ? res.result! : t)
                        );
                    } else {
                        this.notificationService.toast({ severity: 'error', detail: res.message });
                    }
                },
                error: (err) => this.notificationService.handleError(err)
            });
        }
    });
  }

  addTier() {
    const ref = this.dialogService.open(TierDialogComponent, {
        ...DialogConfigWide,
        header: `יצירת תוכנית חדשה`,
    });
    
    ref.onClose.subscribe((formData: Partial<AccountTier> | null) => {
        if (formData) {
            this.apiService.createTier(formData).subscribe({
                next: (res) => {
                    if (res.success && res.result) {
                        this.notificationService.toast({ severity: 'success', detail: 'התוכנית נוצרה בהצלחה.' });
                        this.tiers.update(current => [...current, res.result!]);
                    } else {
                        this.notificationService.toast({ severity: 'error', detail: res.message });
                    }
                },
                error: (err) => this.notificationService.handleError(err)
            });
        }
    });
  }

  confirmDelete(tier: AccountTier) {
    this.notificationService.confirm({
        message: `האם למחוק את התוכנית "${tier.name}"? פעולה זו אינה הפיכה.`,
        header: 'אישור מחיקה',
    }).subscribe(accepted => {
        if (accepted) {
            this.deleteTier(tier.id);
        }
    });
  }
  
  private deleteTier(id: number) {
      this.apiService.deleteTier(id).subscribe({
          next: (res) => {
              if(res.success) {
                this.notificationService.toast({ severity: 'success', detail: res.message });
                this.tiers.update(current => current.filter(t => t.id !== id));
              } else {
                this.notificationService.toast({ severity: 'error', detail: res.message });
              }
          },
          error: (err) => this.notificationService.handleError(err)
      })
  }
}