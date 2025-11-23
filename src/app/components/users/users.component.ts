import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeComponent } from '../shared/badge/badge.component';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';

// App Components & Services
import { LoaderComponent } from '../shared/loader/loader.component';
import { UserDialogComponent } from '../dialogs/user-dialog/user-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { UserStore } from '../../store/user.store';
import { AuthStore } from '../../store/auth.store'; // ייבוא AuthStore

// Enums, Consts & Models
import { userRoleData } from '../../common/enums/userRole.enum';
import { DialogConfig } from '../../common/const/dialog-config';
import { fadeIn400 } from '../../common/const/animations';
import { PageStates } from '../../common/models/pageStates';
import { User } from '../../common/models/user';
import { environment } from '../../../environments/environment';
// import { AccountTier } from '../../common/enums/account-tier.enums';
import { ConfirmationService } from 'primeng/api';
import { TierManagementService } from '../../services/tier-management.service';
import { ExcelImportComponent } from "../shared/excel-import/excel-import.component";
import { ColumnSettingsComponent } from "../shared/column-settings/column-settings.component";
import { ExportColumn, ExcelExportService } from '../../services/excel-export.service';
import { ExcelImportService } from '../../services/excel-import.service';
import { statusData } from '../../common/enums/status.enum';
import { ResponsiveColumnSettingsComponent } from "../shared/responsive-column-settings/responsive-column-settings.component";
import { ApiService } from '../../services/api.service';
import { IconSelectorComponent } from "../shared/icon-selector/icon-selector.component";

export interface UserColumn extends ColumnDefinition {
	key: keyof User;
}

export interface ColumnDefinition {
	key: string;
	header: string;
	disabled?: boolean;
	priority?: number;
	visible?: boolean;
}


@Component({
	selector: 'app-users',
	standalone: true,
	imports: [
    CommonModule, TableModule, ButtonModule, ConfirmDialogModule, InputTextModule,
    FormsModule, BadgeComponent, TooltipModule, LoaderComponent,
    ExcelImportComponent,
    ColumnSettingsComponent,
    ResponsiveColumnSettingsComponent,
    IconSelectorComponent,
],
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css'],
	providers: [ConfirmationService, DialogService],
	animations: [fadeIn400],
})
export class UsersComponent implements OnInit {
	private readonly notificationService = inject(NotificationService);
	private readonly apiService = inject(ApiService);

	private readonly dialogService = inject(DialogService);
	private readonly userStore = inject(UserStore);
	private readonly authStore = inject(AuthStore);
	private readonly tierService = inject(TierManagementService);
	private excelImportService = inject(ExcelImportService);
	private excelExportService = inject(ExcelExportService);

	readonly searchQuery = signal('');

	// readonly AccountTier = AccountTier;

	readonly PageStates = PageStates;
	readonly pageState = signal(PageStates.Loading);

	readonly userRoleData = userRoleData;
	readonly userStatusData = statusData;

	readonly users = this.userStore.activeUsers;
	readonly usersCount = computed(() => this.users().length);
	readonly accountTier = computed(() => this.authStore.user()?.account?.tier);
	readonly userLimit = this.tierService.getLimitFor('users');
	readonly hasReachedUserLimit = this.tierService.hasReachedLimit('users');
	readonly tooltipMessage = this.tierService.getTooltipMessage('users');
	readonly isLimited = computed(() => {
		const limit = this.userLimit;
		return limit !== -1 && limit !== Infinity;
	});

	isImporting = signal(false);


	constructor() {
		effect(() => {
			const isLoading = this.userStore.isLoading();
			const error = this.userStore.error();
			const users = this.userStore.users();

			if (isLoading) this.pageState.set(PageStates.Loading);
			else if (error && users.length === 0) this.pageState.set(PageStates.Error);
			else if (this.users().length > 0) this.pageState.set(PageStates.Ready);
			else this.pageState.set(PageStates.Empty);
		});
	}

	ngOnInit() {
		this.userStore.loadUsers({});
	}

	public refreshData(): void {
		this.userStore.loadUsers({ force: true });
	}

	public addUser(): void {
		if (this.hasReachedUserLimit()) {
			this.notificationService.toast({
				severity: 'warn',
				summary: 'מגבלה הושגה',
				detail: 'לא ניתן להוסיף משתמשים נוספים בתוכנית הנוכחית.',
			});
			return;
		}
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

	public confirmDelete(user: User): void {
		this.notificationService.confirm({
			header: 'מחיקת משתמש',
			message: `האם למחוק את המשתמש "${user.username}"?`,
			icon: 'pi pi-user-minus',
		}).subscribe((accepted) => {
			if (accepted) this.deleteUser(user);
		});
	}

	private deleteUser(user: User): void {
		this.userStore.deleteUser(user.id);
	}

	public getImageUrl(image: string | null | undefined): string {
		if (!image) return 'assets/images/avatar.png';
		return image.startsWith('http') ? image : `${environment.apiUrl}/${image}`;
	}

	// Computed property for filtering users based on search query
	readonly filteredUsers = computed(() => {
		const query = this.searchQuery().toLowerCase();
		if (!query) {
			return this.users();
		}
		return this.users().filter(user =>
			user.username.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query)
		);
	});



	// בקובץ users.component.ts - עדכן את הגדרת הcolumns:

	columns = signal<UserColumn[]>([
		{ key: 'username', header: 'שם משתמש', visible: true, disabled: true, priority: 1 },
		{ key: 'status', header: 'סטטוס', visible: true, priority: 2 },
		{ key: 'email', header: 'דואל', visible: true, priority: 3 },
		{ key: 'role', header: 'תפקיד', visible: true, priority: 4 },
		{ key: 'phone', header: 'טלפון', visible: true, priority: 5 },
		{ key: 'accountId', header: 'מזהה חשבון', visible: true, priority: 6 },
		{ key: 'createdAt', header: 'נוצר בתאריך', visible: true, priority: 7 },
		{ key: 'updatedAt', header: 'עודכן לאחרונה', visible: true, priority: 8 },
		// { key: 'createdBy', header: 'נוצר ע"י', visible: true, disabled: true },
	]);

	getCellValue(user: User, column: UserColumn): any {
		const value = user[column.key];
		if (value === null || value === undefined) return '-';

		if (typeof value === 'object' && !Array.isArray(value)) {
			// Assuming object has a 'name' property, can be made more robust
			return (value as any).name || '-';
		}

		if (typeof value === 'string' && !isNaN(Date.parse(value))) {
			return new Date(value).toLocaleDateString('he-IL');
		}

		return value;
	}

	saveColumnSettings(finalColumns: ColumnDefinition[]): void {
		console.log('Saving column settings to the server:', finalColumns);
	}

	exportTableToExcel(): void {
		const visibleColumns = this.columns().filter(col => col.visible);
		const exportColumns: ExportColumn[] = visibleColumns.map(col => ({
			key: col.key,
			header: col.header,
			transform: col.key === 'status'
				? ExcelExportService.transformers.booleanToHebrew
				: undefined
		}));
		this.excelExportService.exportToExcel(this.users(), exportColumns, {
			fileName: 'users_export', includeTimestamp: true
		});
	}

	// onColumnsUpdated(updatedColumns: ColumnDefinition[]): void {
	// 	this.columns.set(updatedColumns as UserColumn[]);
	// }

	async onDataImported(rawData: any[]): Promise<void> {
		const { validRows, invalidRows } = this.excelImportService.processImportedData<User>(
			rawData,
			this.columns(),
			this.users(),
			'email'
		);

		if (invalidRows.length > 0) {
			this.notificationService.toast({
				severity: 'warn',
				summary: `נמצאו ${invalidRows.length} שורות לא תקינות`,
				detail: 'שורות אלו לא יובאו. ראה קונסול לפרטים.',
				life: 7000
			});
		}

		if (validRows.length > 0) {
			// קרא למתודה שמטפלת בשליחה לשרת
			this.handleBulkInsert(validRows as User[]);
		} else {
			this.notificationService.toast({
				severity: 'info',
				summary: 'לא נמצאו רשומות חדשות לייבוא',
				detail: 'כל השורות בקובץ כבר קיימות במערכת או לא תקינות.'
			});
		}
	}

	// המתודה שמטפלת בשליחה לשרת
	private handleBulkInsert(usersToInsert: User[]): void {
		this.isImporting.set(true);
		this.notificationService.toast({
			severity: 'info',
			summary: 'מייבא נתונים...',
			detail: `שולח ${usersToInsert.length} רשומות חדשות לשרת.`
		});

		this.apiService.bulkInsertUsers(usersToInsert).subscribe({
			next: (response) => {
				if (response.success && response.result) {
					// עדכן את המצב המקומי עם המשתמשים החדשים שחזרו מהשרת
					this.userStore.addUsers(response.result);

					this.notificationService.toast({
						severity: 'success',
						summary: 'הייבוא הושלם',
						detail: response.message
					});
				} else {
					this.notificationService.toast({
						severity: 'error',
						summary: 'שגיאה בייבוא',
						detail: response.message || 'השרת החזיר שגיאה.'
					});
				}
			},
			error: (err) => {
				console.error('Error during bulk insert:', err);
				this.notificationService.handleError(err);
			},
			complete: () => {
				this.isImporting.set(false); // הסתר את ה-loader
			}
		});
	}
}