import { PanelMenu, PanelMenuModule } from 'primeng/panelmenu';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MenuService } from '../../../services/menu.service';
import { AuthStore } from '../../../store/auth.store';

@Component({
	selector: 'app-side-menu',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PanelMenu, TooltipModule],
	templateUrl: './side-menu.component.html',
	styleUrl: './side-menu.component.scss',
	animations: [],
})
export class SideMenuComponent implements OnInit {
	items: MenuItem[] = [];

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
	}

	ngOnInit() {
		this.initMenu();
		this.authStore.loadUser();

		const url = this.router.url.split('?')[0];
		const isSettingsPage = url.includes('settings');
		if (isSettingsPage) {
			this.expandSettings(true);
		}
	}

	private expandSettings(state: boolean) {
		const settingsItem = this.items.find((item) => item['key'] === 'settings');
		if (settingsItem) {
			settingsItem.expanded = state;
			this.menuService.saveSubmenuState('settings', state);
		}
	}

	private restoreSubmenuState() {
		this.items.forEach((item) => {
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

	
	private initMenu() {
		this.items = [
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
			{
				separator: true,
				key: 'separator',
			},
			{
				label: 'ai',
				icon: 'network_intelligence',
				key: 'ai',
				routerLink: 'ai',
				routerLinkActiveOptions: true,
				styleClass: 'menu-item',
				matTooltip: 'ai',
				command: () => {
					this.menuService.closeMobileMenu();
				},
			},
			// {
			//   isChild: false,
			//   label: 'הגדרות',
			//   icon: 'settings',
			//   key: 'settings',
			//   routerLink: 'settings',
			//   styleClass: 'menu-item',
			//   queryParams: { main_tab: 0 },
			//   routerLinkActiveOptions: { exact: false, queryParams: 'subset' },
			//   matTooltip: 'הגדרות',
			//   command: () => {
			//     this.menuService.closeMobileMenu();
			//   },
			//   items: [
			//     {
			//       icon: 'table_view',
			//       label: 'טבלאות מערכת',
			//       key: 'tablesTabs',
			//       routerLink: 'settings',
			//       queryParams: { main_tab: 0 },
			//       isChild: true,
			//       styleClass: 'submenu-item',
			//       matTooltip: 'טבלאות מערכת',
			//       command: () => {
			//         this.menuService.closeMobileMenu();
			//       },
			//     },
			//     {
			//       icon: 'admin_panel_settings',
			//       label: 'מנהל מערכת',
			//       key: 'adminTab',
			//       routerLink: 'settings',
			//       queryParams: { main_tab: 3 },
			//       isChild: true,
			//       styleClass: 'submenu-item',
			//       // visible: UserRole.Admin === StateService.USER()?.role,
			//       command: () => {
			//         this.menuService.closeMobileMenu();
			//       },
			//     },
			//   ],
			// },
			{
				isChild: false,
				key: 'shrinkExpand',
				label: 'מזער תפריט',
				icon: 'keyboard_double_arrow_left',
				styleClass: 'menu-item',
				command: () => {
					this.items.forEach((item) => {
						if (item['key'] && item.expanded !== undefined) {
							this.menuService.saveSubmenuState(item['key'], item.expanded);
						}
					});

					this.menuService.toggleMenuExpand();
				},
			},
			// {
			// 	isChild: false,
			// 	key: 'logout',
			// 	label: 'יציאה',
			// 	icon: 'logout',
			// 	styleClass: 'menu-item',
			// 	command: () => {
			// 		this.signOut();
			// 	},
			// },
		];
	}


	
}
