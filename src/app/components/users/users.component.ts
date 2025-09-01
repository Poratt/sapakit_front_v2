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
import { DialogService } from 'primeng/dynamicdialog';
import { LoaderComponent } from '../shared/loader/loader.component';
import { NotificationService } from '../../services/notification.service';
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
		FormsModule, BadgeComponent, TooltipModule, LoaderComponent,
	],
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css'],
	providers: [ConfirmationService, DialogService],
	animations: [fadeIn400],
})
export class UsersComponent implements OnInit {
	private readonly notificationService = inject(NotificationService);
	private readonly dialogService = inject(DialogService);
	private readonly userStore = inject(UserStore);
	
	readonly PageStates = PageStates;
	readonly pageState = signal(PageStates.Loading);
	readonly userRoleData = userRoleData;
	readonly searchQuery = signal('');
	
	readonly users = this.userStore.activeUsers;

	readonly filteredUsers = computed(() => {
		const allUsers = this.users();
		const query = this.searchQuery().toLowerCase();
		if (!query) return allUsers;
		return allUsers.filter((u) =>
			u.username?.toLowerCase().includes(query) ||
			u.email?.toLowerCase().includes(query)
		);
	});

	constructor() {
		effect(() => {
            const isLoading = this.userStore.isLoading();
            const error = this.userStore.error();
            const users = this.userStore.users();
            
            if (isLoading) this.pageState.set(PageStates.Loading);
            else if (error && users.length === 0) this.pageState.set(PageStates.Error);
            else if (users.length > 0) this.pageState.set(PageStates.Ready);
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
}