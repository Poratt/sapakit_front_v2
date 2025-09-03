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
	private readonly authStore = inject(AuthStore);
	private readonly tierService = inject(TierManagementService);

	readonly searchQuery = signal('');

	// readonly AccountTier = AccountTier;

	readonly PageStates = PageStates;
	readonly pageState = signal(PageStates.Loading);

	readonly userRoleData = userRoleData;

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
}