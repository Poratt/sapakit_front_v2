import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { StatsStore } from './stats.store';
import { SupplierStore } from './supplier.store';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateOrderDto } from '../common/dto/order-create.dto';
import { OrderStatus } from '../common/enums/order-status.enum';
import { OrderType } from '../common/enums/order-type';
import { ReminderType } from '../common/enums/reminderType';
import { Order } from '../common/models/order';
import { Supplier } from '../common/models/supplier';
import { formatDateToYYYYMMDD, parseDateStringAsLocal } from '../common/utils/date.utils';


// --- Helper Functions (Module-level for reusability) ---
function _isOrderDayForSupplier(supplier: Supplier, date: Date): boolean {
	if (supplier.orderType === OrderType.ByDay) return supplier.orderDays?.includes(date.getDay()) ?? false;
	if (supplier.orderType === OrderType.ByDate) return supplier.orderDates?.includes(date.getDate()) ?? false;
	return false;
}

function _getStartOfWeek(date: Date): Date {
	const newDate = new Date(date);
	newDate.setHours(0, 0, 0, 0);
	newDate.setDate(newDate.getDate() - newDate.getDay());
	return newDate;
}

// --- State Shape ---
interface OrderState {
	orders: Order[]; // For calendar date range
	openOrders: Order[]; // For draft orders list
	isLoading: boolean;
	error: string | null;
	currentDateRange: LoadOrdersParams | null;
}

const initialState: OrderState = {
	orders: [],
	openOrders: [],
	isLoading: false,
	error: null,
	currentDateRange: null,
};

interface LoadOrdersParams {
	supplierIds: number[];
	startDate: string;
	endDate: string;
}

// --- The Store ---
export const OrderStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withComputed(({ orders }, supplierStore = inject(SupplierStore)) => ({
		ordersCount: computed(() => orders().length),
		sentOrders: computed(() => orders().filter(o => o.status === OrderStatus.Sent)),
		draftOrdersList: computed(() => orders().filter(s => s.status === OrderStatus.Draft)),
		todayOrdersComputed: computed(() => {
			// Create today's date in local time
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Set to midnight local time
			const todayString = formatDateToYYYYMMDD(today); // Get YYYY-MM-DD in local time

			const allSuppliers = supplierStore.suppliers();
			const allOrders = orders();
			const ordersMap = new Map<string, Order>(
				allOrders.map((o) => [`${o.supplierId}-${o.date}`, o])
			);

			const dueToday: Order[] = [];

			for (const supplier of allSuppliers) {
				if (_isOrderDayForSupplier(supplier, today)) {
					const orderKey = `${supplier.id}-${todayString}`; // Use local date string
					const existingOrder = ordersMap.get(orderKey);

					if (existingOrder) {
						// Add supplierName to existing order
						dueToday.push({
							...existingOrder,
							supplierName: supplier.name, // Ensure supplierName is set
						});
					} else {
						if (supplier.reminderType === ReminderType.UntilOrderDone) {
							const weekStart = _getStartOfWeek(today);
							const weekEnd = new Date(weekStart);
							weekEnd.setDate(weekStart.getDate() + 6);

							let hasSentOrderThisWeek = false;
							for (const order of allOrders) {
								if (order.supplierId === supplier.id && order.status === OrderStatus.Sent) {
									const orderDate = parseDateStringAsLocal(order.date); // Parse as local date
									if (orderDate >= weekStart && orderDate <= weekEnd) {
										hasSentOrderThisWeek = true;
										break;
									}
								}
							}
							if (!hasSentOrderThisWeek) {
								dueToday.push({
									supplierId: supplier.id,
									date: todayString,
									status: OrderStatus.Today,
									supplierName: supplier.name, // Already included
								} as Partial<Order> as Order);
							}
						} else {
							dueToday.push({
								supplierId: supplier.id,
								date: todayString,
								status: OrderStatus.Today,
								supplierName: supplier.name, // Already included
							} as Partial<Order> as Order);
						}
					}
				}
			}
			return dueToday.filter(order => order.status !== OrderStatus.Sent);

		})
	})),

	withMethods((
		store,
		apiService = inject(ApiService),
		notificationService = inject(NotificationService),
		statsStore = inject(StatsStore),
		supplierStore = inject(SupplierStore)
	) => {
		const methods = {
			loadDraftOrders: rxMethod<void>(
				pipe(
					tap(() => patchState(store, { isLoading: true })),
					switchMap(() =>
						apiService.findOrdersByStatus([OrderStatus.Draft]).pipe(
							tap(response => {
								if (response.success && response.result) {
									patchState(store, { openOrders: response.result, isLoading: false });
								}
							}),
							catchError((err: HttpErrorResponse) => {
								patchState(store, { error: err.message, isLoading: false });
								return of();
							})
						)
					)
				)
			),
			loadOrdersByDateRange: rxMethod<LoadOrdersParams>(
				pipe(
					tap((params) => patchState(store, { isLoading: true, error: null, currentDateRange: params })),
					switchMap((params) =>
						apiService.findOrdersBySuppliersAndDateRange(params).pipe(
							tap({
								next: (response) => {
									if (response.success && response.result) {
										patchState(store, { orders: response.result, isLoading: false });
									} else {
										patchState(store, { error: response.message || 'Failed to load orders', isLoading: false });
									}
								},
							}),
							catchError((err: HttpErrorResponse) => {
								patchState(store, { error: err.message, isLoading: false });
								notificationService.toast({ severity: 'error', detail: 'שגיאה בטעינת הזמנות' });
								return of();
							})
						)
					)
				)
			),
			saveOrder: rxMethod<CreateOrderDto>(
				pipe(
					switchMap((orderPayload) =>
						apiService.createOrUpdateOrder(orderPayload).pipe(
							tap({
								next: (response) => {
									if (response.success) {
										notificationService.toast({ severity: 'success', detail: response.message || 'ההזמנה נשמרה בהצלחה' });

										statsStore.loadStats({ force: true });

										methods.loadDraftOrders();

										const range = store.currentDateRange();
										if (range) {
											methods.loadOrdersByDateRange(range);
										}
									} else {
										notificationService.toast({ severity: 'error', detail: response.message || 'שגיאה בשמירת ההזמנה' });
									}
								},
							}),
							catchError((err: HttpErrorResponse) => {
								notificationService.toast({ severity: 'error', detail: err.message || 'שגיאה קריטית בשמירת ההזמנה' });
								return of();
							})
						)
					)
				)
			),
		};
		return methods;
	})
);