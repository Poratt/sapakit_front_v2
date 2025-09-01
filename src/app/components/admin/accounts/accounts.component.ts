import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { NotificationService } from '../../../services/notification.service';
import { UserRole, userRoleData } from '../../../common/enums/userRole.enum';
import { DialogConfig } from '../../../common/const/dialog-config';
import { UserDialogComponent } from '../../dialogs/user-dialog/user-dialog.component';
import { fadeIn400 } from '../../../common/const/animations';
import { PageStates } from '../../../common/models/pageStates';
import { User } from '../../../common/models/user';
import { Account } from '../../../common/models/account';
import { BadgeModule } from 'primeng/badge';
import { ApiService } from '../../../services/api.service';
import { trigger, state, style, transition, animate, sequence } from '@angular/animations';
import { UserStore } from '../../../store/user.store';


@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ConfirmDialogModule, InputTextModule,
    FormsModule, BadgeComponent, TooltipModule, LoaderComponent, BadgeModule
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css'],
  providers: [ConfirmationService, DialogService],
  animations: [fadeIn400, 
        trigger('rowExpansionTrigger', [
          transition(':enter', [
            style({
              height: '0px',
              opacity: 0,
              overflow: 'hidden',
              transform: 'scaleY(0.1) translateY(-10px)',
              transformOrigin: 'top center',
              filter: 'blur(1px)',
              willChange: 'transform, height, opacity'
            }),
            sequence([
              animate('200ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({
                height: '*',
                transform: 'scaleY(0.8) translateY(-2px)',
                filter: 'blur(0.5px)'
              })),
              animate('150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({
                opacity: 1,
                transform: 'scaleY(1) translateY(0)',
                filter: 'blur(0px)'
              }))
            ])
          ]),
    
          transition(':leave', [
            animate('250ms cubic-bezier(0.4, 0.0, 0.6, 1)', style({
              height: '0px',
              opacity: 0,
              overflow: 'hidden',
              transform: 'scaleY(0.1) translateY(-5px)',
              filter: 'blur(1px)'
            }))
          ])
    
        ])
  ],
})

export class AccountsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly dialogService = inject(DialogService);
  private readonly apiService = inject(ApiService);
  private readonly userStore = inject(UserStore);

  readonly PageStates = PageStates;
  readonly pageState = signal(PageStates.Loading);
  readonly userRoleData = userRoleData;
  readonly searchQuery = signal('');

  readonly accounts = signal<Account[]>([]);
  expandedRows = {};

readonly filteredAccounts = computed(() => {
    const allAccounts = this.accounts();
    const query = this.searchQuery().toLowerCase();
    if (!query) return allAccounts;

    return allAccounts
        .map(account => {
            // צור עותק של החשבון כדי לא לשנות את המקור
            const filteredAccount = { ...account }; 
            
            // סנן את המשתמשים הפנימיים
            const matchingUsers = account.users?.filter(u => 
                u.username.toLowerCase().includes(query) || 
                u.email.toLowerCase().includes(query)
            );

            // עדכן את מערך המשתמשים בחשבון המסונן
            filteredAccount.users = matchingUsers;
            
            return filteredAccount;
        })
        .filter(account => 
            // השאר את החשבון רק אם הוא עצמו תואם לחיפוש, או שיש לו משתמשים תואמים
            account.name.toLowerCase().includes(query) || 
            (account.users && account.users.length > 0)
        );
});

  ngOnInit() {
    this.loadAccounts();
  }

  public refreshData(): void {
    this.loadAccounts();
  }

  private loadAccounts(): void {
    this.pageState.set(PageStates.Loading);
    this.apiService.getAllAccountsWithUsers().subscribe({
      next: (response) => {
        if (response.success && response.result) {
          this.accounts.set(response.result);
          this.pageState.set(response.result.length > 0 ? PageStates.Ready : PageStates.Empty);
        } else {
          this.pageState.set(PageStates.Error);
        }
      },
      error: () => this.pageState.set(PageStates.Error),
    });
  }

  public editUser(user: User): void {
    const ref = this.dialogService.open(UserDialogComponent, {
      ...DialogConfig,
      header: `עריכת משתמש | ${user.email}`,
      data: { user },
    });
    ref.onClose.subscribe((updatedUser: User | undefined) => {
      if (updatedUser) {
        this.loadAccounts(); // טען מחדש את כל החשבונות כדי לסנכרן
        this.notificationService.toast({ severity: 'success', detail: 'המשתמש עודכן בהצלחה' });
      }
    });
  }

  public confirmDelete(item: User | Account): void {
    const isAccount = 'users' in item;
    if (isAccount) {
      this.notificationService.confirm({
        header: 'מחיקת חשבון',
        message: `פעולה זו תמחק לצמיתות את החשבון "${item.name}" וכל הנתונים המשויכים אליו. האם אתה בטוח?`,
        icon: 'pi pi-exclamation-triangle',
      }).subscribe((accepted) => {
        if (accepted) this.deleteAccount(item as Account);
      });
    } else {
      const user = item as User;
      this.notificationService.confirm({
        header: 'מחיקת משתמש',
        message: `האם למחוק את המשתמש "${user.username}"?`,
        icon: 'pi pi-user-minus',
      }).subscribe((accepted) => {
        if (accepted) this.deleteUser(user);
      });
    }
  }

  private deleteAccount(account: Account): void {
    this.apiService.deleteAccount(account.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.toast({ severity: 'success', detail: response.message });
          this.accounts.update(current => current.filter(acc => acc.id !== account.id));
        } else {
          this.notificationService.toast({ severity: 'error', detail: response.message });
        }
      },
      error: (err) => {
        this.notificationService.toast({ severity: 'error', detail: err.error?.message || 'שגיאה במחיקת החשבון' });
      }
    });
  }
  
  private deleteUser(user: User): void {
    this.userStore.deleteUser(user.id);
    // אחרי מחיקה, רענן את הנתונים כדי שהשינוי יופיע
    // אפשר להוסיף delay קטן אם רוצים
    setTimeout(() => this.loadAccounts(), 100);
  }

  
	private loadAccountsForAdmin(): void {
		// ✅ ננהל את המצב ישירות כאן
		this.pageState.set(PageStates.Loading);
		this.apiService.getAllAccountsWithUsers().subscribe({
			next: (response) => {
				if (response.success && response.result) {
					this.accounts.set(response.result);
					if (response.result.length > 0) {
						this.pageState.set(PageStates.Ready);
					} else {
						this.pageState.set(PageStates.Empty);
					}
				} else {
					this.pageState.set(PageStates.Error);
				}
			},
			error: () => {
				this.pageState.set(PageStates.Error);
			},
		});
	}

	

	onRowExpand(event: TableRowExpandEvent) {
		console.log({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
	}

	onRowCollapse(event: TableRowCollapseEvent) {
		console.log({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
	}

	editAccount(account: Account) {

	}
}