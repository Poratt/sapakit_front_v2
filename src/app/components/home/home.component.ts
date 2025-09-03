import { OrderFlowService } from './../../services/order-flow.service';
import { Component, inject, signal, OnInit, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { DialogService } from 'primeng/dynamicdialog';
import { LoaderComponent } from '../shared/loader/loader.component';
import { CountUpComponent } from "../shared/count-up/count-up.component";
import { SupplierDialogComponent } from '../dialogs/supplier-dialog/supplier-dialog.component';
import { OrdersListDialogComponent } from '../dialogs/orders-list-dialog/orders-list-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { SupplierStore } from '../../store/supplier.store'

import { OrderStatus } from '../../common/enums/order-status.enum';
import { CreateOrderDto } from '../../common/dto/order-create.dto';
import { DialogConfig } from '../../common/const/dialog-config';
import { fadeIn400 } from '../../common/const/animations';
import { OrderStore } from '../../store/order.store';
import { StatsStore } from '../../store/stats.store';
import { AdvancedCalendarComponent } from "../calendar/advanced-calendar/advanced-calendar.component";
import { parseDateStringAsLocal } from '../../common/utils/date.utils';
import { Order } from '../../common/models/order';
import { PageStates } from '../../common/models/pageStates';
import { Supplier } from '../../common/models/supplier';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, CardModule, ButtonModule, TooltipModule, LoaderComponent, MessageModule,
		AnimateOnScrollModule, CountUpComponent, AdvancedCalendarComponent],
	providers: [DialogService],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
	animations: [fadeIn400],
})
export class HomeComponent {
	// --- Stores ---
	private readonly supplierStore = inject(SupplierStore);
	private readonly orderStore = inject(OrderStore);
	private readonly statsStore = inject(StatsStore);

	// --- Services ---
	private readonly notificationService = inject(NotificationService);
	private readonly dialogService = inject(DialogService);
	private readonly orderFlowService = inject(OrderFlowService);

	private readonly isInitialLoad = signal(true);

	// --- Data Signals ---
	readonly suppliers = this.supplierStore.suppliers;
	readonly stats = this.statsStore.stats;
	readonly activeSuppliers = this.supplierStore.activeSuppliers;
	readonly OrderStatus = OrderStatus;
	readonly PageStates = PageStates;
	readonly pageState = computed(() => {
		const isLoading = this.supplierStore.isLoading() || this.statsStore.isLoading();
		const hasError = this.supplierStore.error() || this.statsStore.error();
		const isInitial = this.isInitialLoad();

		if (isInitial && isLoading) return PageStates.Loading;
		if (isInitial && hasError) return PageStates.Error;

		return PageStates.Ready;
	});

	constructor() {
		this.supplierStore.loadSuppliers({});
		// this.statsStore.loadStats({});

		// פשוט יותר - רק עוקב אחר השלמת הטעינה הראשונית
		effect(() => {
			const isLoading = this.supplierStore.isLoading() || this.statsStore.isLoading();

			if (this.isInitialLoad() && !isLoading) {
				this.isInitialLoad.set(false);
			}
		});
	}
	// --- User Actions ---
	addSupplier(): void {
		const ref = this.dialogService.open(SupplierDialogComponent, {
			
			...DialogConfig,
			header: 'הוספת ספק חדש',
			data: { suppliers: this.suppliers() },
		});

		ref.onClose.subscribe((newSupplier: Supplier | undefined) => {
			if (newSupplier) {
				this.supplierStore.addSupplier(newSupplier);
			}
		});
	}

	showOrdersListDialog(status: OrderStatus): void {
		
		const ref = this.dialogService.open(OrdersListDialogComponent, {
			...DialogConfig,
			header: status === OrderStatus.Draft ? 'הזמנות טיוטה | פתוחות' : 'הזמנות לביצוע היום',
			data: { status }
		});

		ref.onClose.subscribe((result: { action: 'edit' | 'delete' | 'create', data: Order } | undefined) => {
			if (!result) return;

			if (result.action === 'edit') {
				this.openOrderForEditing(result.data);
			} else if (result.action === 'delete') {
				this.handleRemoveDraft(result.data);
			} else if (result.action === 'create') {
				// טיפול ביצירת הזמנה חדשה מתזכורת
				const supplier = this.supplierStore.suppliersById()[result.data.supplierId];
				if (supplier) {
					this.orderFlowService.openOrderDialog({
						supplier: supplier,
						date: new Date(), // הזמנה חדשה היא תמיד להיום
						existingOrder: null
					});
				}
			}
		});
	}

	private openOrderForEditing(order: Order): void {
		const supplier = this.supplierStore.getSupplierById(order.supplierId);
		if (!supplier) {
			this.notificationService.toast({ severity: 'warn', detail: 'הספק המשויך להזמנה לא נמצא.' });
			return;
		}

		const correctDate = parseDateStringAsLocal(order.date);
		console.log('Parsed date:', correctDate); // For debugging
		console.log('Day:', correctDate.getDate(), 'Month:', correctDate.getMonth() + 1, 'Year:', correctDate.getFullYear());

		this.orderFlowService.openOrderDialog({
			supplier: supplier,
			date: correctDate,
			existingOrder: order,
		});
	}

	private handleRemoveDraft(orderToDelete: Order): void {
		const resetOrderPayload: CreateOrderDto = {
			id: orderToDelete.id,
			supplierId: orderToDelete.supplierId,
			date: orderToDelete.date.toString(),
			status: OrderStatus.Draft,
			products: []
		};

		this.orderStore.saveOrder(resetOrderPayload);

	}

	refreshDashboard(): void {
		console.log('------- Refreshing data ---------- ');

		this.supplierStore.loadSuppliers({ force: true });
		this.statsStore.loadStats({ force: true });
	}

}


