// in src/app/components/users/users.component.ts

import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
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
import { userRoleData } from '../../common/enums/userRole.enum';
import { DialogConfig } from '../../common/const/dialog-config';
import { UserDialogComponent } from '../dialogs/user-dialog/user-dialog.component';
import { environment } from '../../../environments/environment';
import { fadeIn400 } from '../../common/const/animations';
import { PageStates } from '../../common/models/pageStates';
import { User } from '../../common/models/user';
import { UserStore } from '../../store/user.store';

@Component({
	selector: 'app-users',
	standalone: true,
	imports: [
		CommonModule, TableModule, ButtonModule, ConfirmDialogModule, InputTextModule,
		FormsModule, BadgeComponent, TooltipModule, MessageModule, LoaderComponent,
	],
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css'],
	providers: [ConfirmationService, DialogService],
	animations: [fadeIn400],
})
export class UsersComponent implements OnInit {
	// private readonly apiService = inject(ApiService);
	private readonly notificationService = inject(NotificationService);
	private readonly dialogService = inject(DialogService);
	private readonly excelExportService = inject(ExcelExportService);
	private readonly userStore = inject(UserStore);

	readonly PageStates = PageStates;
	readonly pageState = signal(PageStates.Loading);
	readonly backendUrl = environment.apiUrl;
	readonly statusData = statusData;
	readonly userRoleData = userRoleData;
	readonly searchQuery = signal('');
	public itemToDelete = signal<number | undefined>(undefined);

	readonly users = this.userStore.activeUsers;

	readonly filteredUsers = computed(() => {
		const query = this.searchQuery().toLowerCase();
		const allUsers = this.users();
		if (!query) return allUsers;
		return allUsers.filter((u) =>
			u.username?.toLowerCase().includes(query) ||
			u.email?.toLowerCase().includes(query) ||
			u.phone?.toLowerCase().includes(query)
		);
	});

	constructor() {
		effect(() => {
			const isLoading = this.userStore.isLoading();
			const error = this.userStore.error();
			const users = this.userStore.users();

			if (isLoading) {
				this.pageState.set(PageStates.Loading);
				return;
			}
			if (error) {
				// ה-Store כבר הציג הודעת Toast.
				// הקומפוננטה רק צריכה לעדכן את מצב ה-UI שלה.
				this.pageState.set(PageStates.Error);
				return;
			}
			// חשוב לבדוק את המערך הגולמי, לא את המסונן
			if (users.filter(u => !u.isDeleted).length > 0) {
				this.pageState.set(PageStates.Ready);
			} else if (!isLoading) {
				this.pageState.set(PageStates.Empty);
			}
		});
	}

	ngOnInit() {
		this.userStore.loadUsers({});
	}

	public refreshData(): void {
		this.userStore.loadUsers({ force: true });
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

	public confirmDelete(user: User): void {
		if (user.email === 'porat@mail.com') return
		this.itemToDelete.set(user.id);
		this.notificationService.confirm({
			header: 'מחיקת משתמש',
			message: `האם למחוק את המשתמש "${user.username}"?`,
			icon: 'pi pi-user-minus',
			acceptLabel: 'מחק',
		}).subscribe((accepted) => {
			if (accepted) { this.deleteUser(user); }
			this.itemToDelete.set(undefined);
		});
	}

	private deleteUser(user: User): void {
		this.userStore.deleteUser(user.id);
	}

	// private deleteUser(user: User): void {
	// 	this.apiService.deleteUser(user.id).subscribe({
	// 		next: () => {
	//             this.userStore.removeUser(user.id);
	// 			this.notificationService.toast({ severity: 'success', detail: 'המשתמש נמחק בהצלחה.' });
	// 		},
	// 	});
	// }

	public getImageUrl(image: string | null | undefined): string {
		if (!image) return 'assets/images/avatar.png';
		if (image.startsWith('http') || image.startsWith('data:image')) return image;
		return `${this.backendUrl}${image}`;
	}

	public exportUsers(): void {
		const columns = this.getUserExportColumns();
		this.excelExportService.exportToExcel(this.filteredUsers(), columns, {
			fileName: 'רשימת_משתמשים',
			sheetName: 'משתמשים',
			includeTimestamp: true,
		});
	}

	private getUserExportColumns(): ExportColumn[] {
		return [
			{ key: 'username', header: 'שם משתמש' },
			{ key: 'email', header: 'אימייל' },
			{ key: 'phone', header: 'טלפון' },
			{ key: 'role', header: 'תפקיד', transform: ExcelExportService.transformers.enumToText(userRoleData) },
			{ key: 'status', header: 'סטטוס', transform: ExcelExportService.transformers.enumToText(statusData) },
			{ key: 'createdAt', header: 'תאריך יצירה', transform: ExcelExportService.transformers.dateFormat('short') },
		];
	}
}