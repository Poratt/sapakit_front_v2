import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class MenuService {
	public isMobileMenuOpen = signal<boolean>(false);
	public isMenuExpanded = signal<boolean>(true);
	public isUserPopoverOpen = signal(false);
	expandedSubmenuItems = signal<{ [key: string]: boolean }>({});

	constructor() {
		const storedExpanded = localStorage.getItem('isMenuExpanded');
		if (storedExpanded) {
			this.isMenuExpanded.set(JSON.parse(storedExpanded));
		}
	}

	toggleMobileMenu() {
		this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
		console.log(this.isMobileMenuOpen());
	}

	closeMobileMenu() {
		this.isMobileMenuOpen.set(false);
	}

	toggleMenuExpand() {
		this.isMenuExpanded.set(!this.isMenuExpanded());
		localStorage.setItem('isMenuExpanded', JSON.stringify(this.isMenuExpanded()));
	}

		public toggleUserPopover() {		
		this.isUserPopoverOpen.update(value => !value);
	}

	public closeUserPopover() {		
		this.isUserPopoverOpen.set(false);
	}
	
	saveSubmenuState(key: string, expanded: boolean) {
		this.expandedSubmenuItems.set({
			...this.expandedSubmenuItems(),
			[key]: expanded,
		});
	}

	getSubmenuState(key: string): boolean {
		return this.expandedSubmenuItems()[key] ?? false;
	}
}
