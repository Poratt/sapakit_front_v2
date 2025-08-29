import { RouterOutlet } from '@angular/router';
import { Component, effect, inject } from '@angular/core';
import { SuppliersComponent } from '../suppliers/suppliers.component';
import { HeaderComponent } from '../shared/header/header.component';
import { SideMenuComponent } from '../shared/side-menu/side-menu.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { fadeIn400 } from '../../common/const/animations';
// import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'app-dashboard',
	imports: [RouterOutlet, CommonModule, HeaderComponent, SideMenuComponent],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.css',
	animations: [fadeIn400],
	providers: [],
})
export class DashboardComponent {
	private menuService = inject(MenuService);

	public isMobileMenuOpen = this.menuService.isMobileMenuOpen;
	public isUserPopoverOpen = this.menuService.isUserPopoverOpen;


	// constructor() {
	// 	effect(() => {
	// 		this.isMobileMenuOpen = this.menuService.isMobileMenuOpen;
	// 	});
	// }
	public toggleMobileMenu() {
		this.menuService.toggleMobileMenu();
	}

	closeMenus() {
		this.menuService.closeMobileMenu();
		this.menuService.closeUserPopover();
	}


	// log menu status onInit
	ngOnInit() {
		console.log(`isMobileMenuOpen: ${this.isMobileMenuOpen}`);
		
	}



	onReject() {}
}
