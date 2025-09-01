import { PanelMenu, PanelMenuModule } from 'primeng/panelmenu';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MenuService } from '../../../services/menu.service';
import { AuthStore } from '../../../store/auth.store';
import { UserRole } from '../../../common/enums/userRole.enum';

@Component({
	selector: 'app-side-menu',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PanelMenu, TooltipModule],
	templateUrl: './side-menu.component.html',
	styleUrl: './side-menu.component.scss',
	animations: [],
})
export class SideMenuComponent implements OnInit {
	items = signal<MenuItem[]>([]);

	private router = inject(Router);
	private menuService = inject(MenuService);
	private authStore = inject(AuthStore);

	readonly isGuest = this.authStore.isGuest;
	readonly isLoading = this.authStore.isLoading;
	readonly username = computed(() => this.authStore.user()?.username || this.authStore.user()?.email);

	public isMenuExpanded = this.menuService.isMenuExpanded;


	constructor() {
		effect(() => {
			this.isMenuExpanded();
			this.restoreSubmenuState();
		});

		effect(() => {
			const role = this.authStore.userRole();
			this.buildMenu(role);
		});

	}

	ngOnInit() {
		this.authStore.loadUser();

		const url = this.router.url.split('?')[0];
		const isSettingsPage = url.includes('settings');
		if (isSettingsPage) {
			this.expandSettings(true);
		}
	}

	private expandSettings(state: boolean) {
		const settingsItem = this.items().find((item) => item['key'] === 'settings');
		if (settingsItem) {
			settingsItem.expanded = state;
			this.menuService.saveSubmenuState('settings', state);
		}
	}

	private restoreSubmenuState() {
		this.items().forEach((item) => {
			if (item['key']) {
				item.expanded = this.menuService.getSubmenuState(item['key']);
			}
		});
	}

	public onMenuItemToggle(event: any) {
		const item = event.item as MenuItem;
		if (item['key']) {
			this.menuService.saveSubmenuState(item['key'], !!item.expanded);
		}
	}

	public toggleMobileMenu() {
		this.menuService.toggleMobileMenu();
	}



	public signOut() {
		this.authStore.logout();
	}


	private buildMenu(role: UserRole): void {
		const commonItems: MenuItem[] = [
			{
				separator: true,
				key: 'separator',
			},

			{
				isChild: false,
				key: 'shrinkExpand',
				label: 'מזער תפריט',
				icon: 'keyboard_double_arrow_left',
				styleClass: 'menu-item',
				command: () => {
					this.items().forEach((item) => {
						if (item['key'] && item.expanded !== undefined) {
							this.menuService.saveSubmenuState(item['key'], item.expanded);
						}
					});

					this.menuService.toggleMenuExpand();
				},
			},
		];

		if (role === UserRole.SysAdmin) {
			this.items.set([
				{
					label: 'מערכת',
					icon: 'monitoring',
					key: 'dashboard',
					routerLink: '/admin',
					routerLinkActiveOptions: true,
					styleClass: 'menu-item',
					matTooltip: 'דשבורד מערכת',
					command: () => {
						this.menuService.closeMobileMenu();
					},
				},
				{
					label: 'ניהול חשבונות',
					icon: 'group',
					key: 'accounts',
					routerLink: '/admin/accounts',
					routerLinkActiveOptions: true,
					styleClass: 'menu-item',
					matTooltip: 'ניהול חשבונות',
					command: () => {
						this.menuService.closeMobileMenu();
					},
				},
				...commonItems
			]);
		} else {
			this.items.set([
				{
					label: 'דשבורד',
					icon: 'home',
					key: 'dashboard',
					routerLink: '/',
					routerLinkActiveOptions: true,
					styleClass: 'menu-item',
					matTooltip: 'דשבורד',
					command: () => {
						this.menuService.closeMobileMenu();
					},
				},
				{
					label: 'משתמשים',
					icon: 'group',
					key: 'users',
					routerLink: 'users',
					routerLinkActiveOptions: true,
					styleClass: 'menu-item',
					matTooltip: 'משתמשים',
					command: () => {
						this.menuService.closeMobileMenu();
					},
				},
				{
					label: 'ספקים',
					icon: 'two_pager_store',
					key: 'suppliers',
					routerLink: 'suppliers',
					routerLinkActiveOptions: false,
					styleClass: 'menu-item',
					matTooltip: 'ספקים',
					command: () => {
						this.menuService.closeMobileMenu();
					},
				},
				{
					label: 'הזמנות',
					icon: 'shopping_cart',
					key: 'orders',
					routerLink: 'orders',
					routerLinkActiveOptions: true,
					styleClass: 'menu-item',
					matTooltip: 'הזמנות',
					command: () => {
						this.menuService.closeMobileMenu();
					},
				},
				...commonItems

			])
		}



	}

}