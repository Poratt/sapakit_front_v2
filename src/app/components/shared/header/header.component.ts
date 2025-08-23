// in header.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover'; // ✅ ייבוא הרכיב החדש
import { MenuService } from '../../../services/menu.service';
import { AuthStore } from '../../../store/auth.store';
import { InsightStore } from '../../../store/insight.store';
import { ApiService } from '../../../services/api.service';
import { ButtonModule } from 'primeng/button';
import { StatsStore } from '../../../store/stats.store';
import { OrderFlowService } from '../../../services/order-flow.service';
import { SupplierStore } from '../../../store/supplier.store';
import { Insight } from '../../../common/models/insight';
import { TableModule } from "primeng/table";
import { BadgeComponent } from "../badge/badge.component";
import { HebrewDatePipe } from "../../../pipes/hebrew-date.pipe";
import { OrderStatusPipe } from "../../../pipes/orderStatus.pipe";
import { OrderStatus, orderStatusData } from '../../../common/enums/order-status.enum';
import { Order } from '../../../common/models/order';
import { TooltipModule } from 'primeng/tooltip';
import { OrderStore } from '../../../store/order.store';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { parseDateStringAsLocal } from '../../../common/utils/date.utils';
import { NotificationService } from '../../../services/notification.service';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule, RouterModule, BadgeModule, PopoverModule, ButtonModule, TooltipModule, TableModule, BadgeComponent, HebrewDatePipe, OrderStatusPipe], // ✅ עדכון ה-imports
	providers: [DialogService],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css',
})
export class HeaderComponent {
	private readonly authStore = inject(AuthStore);
	private readonly statsStore = inject(StatsStore);
	private readonly supplierStore = inject(SupplierStore);
	private readonly orderStore = inject(OrderStore);
	public readonly insightStore = inject(InsightStore);
	
	// --- Services ---
	private readonly menuService = inject(MenuService);
	private readonly orderFlowService = inject(OrderFlowService);
	private readonly apiService = inject(ApiService);
	private readonly notificationService = inject(NotificationService);

	// Signals מה-Store נשארים
	public readonly user = this.authStore.user;
	public readonly isGuest = this.authStore.isGuest;
	public readonly isLoading = this.authStore.isLoading;
	public readonly username = computed(() => this.user()?.username || this.user()?.email);
	public readonly stats = this.statsStore.stats;

	public isMobileMenuOpen = this.menuService.isMobileMenuOpen;
	// private isUserPopoverOpen = this.menuService.isUserPopoverOpen;
	public readonly OrderStatus = OrderStatus;
	public readonly orderStatusData = orderStatusData;

	readonly orders = computed(() => {
		return this.orderStore.todayOrdersComputed();

	});

	ngOnInit() {
		this.insightStore.loadInsights();
	}


	generateInsights() {
		this.apiService.getInsights().subscribe({
			next: (res) => {
				if (res.success) {
					console.log(res.result);

					this.insightStore.loadInsights();
				} else {
					console.error('Failed to load insights:', res.message);
				}
			},
			error: (err) => console.error('Error loading insights:', err)
		});
	}

	toggleMobileMenu(): void {
		this.menuService.toggleMobileMenu();
	}

	toggleUserPopover(): void {
		this.menuService.toggleUserPopover();
	}

	closeUserPopover(): void {
		this.menuService.closeUserPopover();
	}

	logout(): void {
		this.authStore.logout();
		this.closeUserPopover();
	}

	markAsRead(insight: Insight): void {
		this.insightStore.markAsRead(insight.id);
	}

	openOrderForSupplier(supplierId: number) {
		const supplier = this.supplierStore.suppliersById()[supplierId];
		if (supplier) {
			this.orderFlowService.openOrderDialog({
				supplier,
				date: new Date(),
				existingOrder: null
			});
		}
	}

	viewOrder(order: Order, popup:any): void {
		popup.hide()
		const supplier = this.supplierStore.getSupplierById(order.supplierId);
		if (!supplier) {
			this.notificationService.toast({ severity: 'warn', detail: 'הספק המשויך להזמנה לא נמצא.' });
			return;
		}
		const correctDate = parseDateStringAsLocal(order.date);
		this.orderFlowService.openOrderDialog({
			supplier: supplier,
			date: correctDate,
			existingOrder: order,
		});
	}
}