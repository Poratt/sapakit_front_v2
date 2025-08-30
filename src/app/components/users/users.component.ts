import { ApiService } from './../../services/api.service';
import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeComponent } from '../shared/badge/badge.component';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { DialogService } from 'primeng/dynamicdialog';
import { LoaderComponent } from '../shared/loader/loader.component';
import { NotificationService } from '../../services/notification.service';
import { ExcelExportService, ExportColumn } from '../../services/excel-export.service';
import { statusData } from '../../common/enums/status.enum';
import { UserRole, userRoleData } from '../../common/enums/userRole.enum';
import { DialogConfig } from '../../common/const/dialog-config';
import { UserDialogComponent } from '../dialogs/user-dialog/user-dialog.component';
import { environment } from '../../../environments/environment';
import { fadeIn400 } from '../../common/const/animations';
import { PageStates } from '../../common/models/pageStates';
import { User } from '../../common/models/user';
import { UserStore } from '../../store/user.store';
import { AuthStore } from '../../store/auth.store';
import { Account } from '../../common/models/account';
import { BadgeModule } from 'primeng/badge';
import { trigger, state, style, transition, animate, sequence } from '@angular/animations';
@Component({
	selector: 'app-users',
	standalone: true,
	imports: [
		CommonModule, TableModule, ButtonModule, ConfirmDialogModule, InputTextModule,
		FormsModule, BadgeComponent, TooltipModule, MessageModule, LoaderComponent,
		BadgeModule
	],
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css'],
	providers: [ConfirmationService, DialogService],
	animations: [
		fadeIn400,
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
export class UsersComponent implements OnInit {
	private readonly notificationService = inject(NotificationService);
	private readonly dialogService = inject(DialogService);
	private readonly userStore = inject(UserStore);
	private readonly authStore = inject(AuthStore);
	private readonly apiService = inject(ApiService);

	readonly backendUrl = environment.apiUrl;
	readonly PageStates = PageStates;
	readonly pageState = signal(PageStates.Loading);
	readonly userRoleData = userRoleData;
	readonly searchQuery = signal('');
	public itemToDelete = signal<number | undefined>(undefined);

	readonly usersForCurrentUser = this.userStore.activeUsers;
	readonly userRole = this.authStore.userRole;
	readonly UserRoles = UserRole;

	readonly accounts = signal<Account[]>([]);
	expandedAccounts = signal<{ [key: number]: boolean }>({});


	readonly filteredUsers = computed(() => {
		const allUsers = this.usersForCurrentUser();
		const query = this.searchQuery().toLowerCase();
		if (!query) return allUsers;
		return allUsers.filter((u) =>
			u.username?.toLowerCase().includes(query) ||
			u.email?.toLowerCase().includes(query)
		);
	});

	readonly filteredAccounts = computed(() => {
		const allAccounts = this.accounts();
		const query = this.searchQuery().toLowerCase();
		if (!query) return allAccounts;
		return allAccounts.filter(acc =>
			acc.name.toLowerCase().includes(query) ||
			acc.users?.some(u => u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
		);
	});

	constructor() {
		effect(() => {
			// רץ רק אם המשתמש הוא *לא* SysAdmin
			if (this.userRole() !== UserRole.SysAdmin) {
				const isLoading = this.userStore.isLoading();
				const error = this.userStore.error();
				const users = this.userStore.users();

				if (isLoading) this.pageState.set(PageStates.Loading);
				else if (error && users.length === 0) this.pageState.set(PageStates.Error);
				else if (users.length > 0) this.pageState.set(PageStates.Ready);
				else this.pageState.set(PageStates.Empty);
			}
		});

		// Effect #2: מטפל במצב הדף עבור SysAdmin
		effect(() => {
			// רץ רק אם המשתמש הוא SysAdmin
			if (this.userRole() === UserRole.SysAdmin) {
				const accounts = this.accounts();
				const currentState = this.pageState();

				if (currentState !== PageStates.Loading) {
					if (accounts.length > 0) {
						this.pageState.set(PageStates.Ready);
					} else {
						this.pageState.set(PageStates.Empty);
					}
				}
			}
		});
	}

	ngOnInit() {
		if (this.userRole() === UserRole.SysAdmin) {
			this.loadAccountsForAdmin();
		} else {
			this.userStore.loadUsers({});
		}
	}

	public refreshData(): void {
		if (this.userRole() === UserRole.SysAdmin) {
			this.loadAccountsForAdmin();
		} else {
			this.userStore.loadUsers({ force: true });
		}
	}

	public addUser(): void {
		const ref = this.dialogService.open(UserDialogComponent, {
			...DialogConfig,
			header: 'הוספת משתמש חדש',
		});
		ref.onClose.subscribe((newUser: User | undefined) => {
			if (newUser) {
				this.userStore.addUser(newUser);
				this.notificationService.toast({ severity: 'success', detail: 'המשתמש נוצר בהצלחה' });
			}
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
				this.userStore.updateUser(updatedUser);
				this.notificationService.toast({ severity: 'success', detail: 'המשתמש עודכן בהצלחה' });
			}
		});
	}

	public confirmDelete(item: User | Account): void {
		const isAccount = 'users' in item; // דרך פשוטה להבדיל בין חשבון למשתמש

		if (isAccount) {
			// לוגיקת מחיקת חשבון
			this.notificationService.confirm({
				header: 'מחיקת חשבון',
				message: `פעולה זו תמחק לצמיתות את החשבון "${item.name}" וכל הנתונים המשויכים אליו (משתמשים, ספקים, הזמנות). האם אתה בטוח?`,
				icon: 'pi pi-exclamation-triangle',
			}).subscribe((accepted) => {
				if (accepted) this.deleteAccount(item as Account);
			});
			
		} else {
			const user = item as User;
			this.itemToDelete.set(user.id);
			this.notificationService.confirm({
				header: 'מחיקת משתמש',
				message: `האם למחוק את המשתמש "${user.username}"?`,
				icon: 'pi pi-user-minus',
			}).subscribe((accepted) => {
				if (accepted) { this.deleteUser(user); }
				this.itemToDelete.set(undefined);
			});
		}
	}
	private deleteUser(user: User): void {
		this.userStore.deleteUser(user.id);
	}

	private deleteAccount(account: Account): void {
		this.apiService.deleteAccount(account.id).subscribe({
			next: (response) => {
				if (response.success) {
					this.notificationService.toast({ severity: 'success', detail: response.message });
					// עדכן את המצב המקומי
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
	public getImageUrl(image: string | null | undefined): string {
		if (!image) return 'assets/images/avatar.png';
		if (image.startsWith('http') || image.startsWith('data:image')) return image;
		return `${this.backendUrl}/${image}`;
	}

	public exportUsers(): void {
		// const columns = this.getUserExportColumns();
		// this.excelExportService.exportToExcel(this.filteredUsers(), columns, {
		// 	fileName: 'רשימת_משתמשים',
		// 	sheetName: 'משתמשים',
		// 	includeTimestamp: true,
		// });
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

	expandedRows = {};

	onRowExpand(event: TableRowExpandEvent) {
		console.log({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
	}

	onRowCollapse(event: TableRowCollapseEvent) {
		console.log({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
	}

	editAccount(account: Account) {

	}

}

