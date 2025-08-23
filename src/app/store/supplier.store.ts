import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, filter, of, pipe, switchMap, tap } from 'rxjs';
import { Status } from '../common/enums/status.enum';
import { NotificationService } from '../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Supplier } from '../common/models/supplier';

// 1. Define the state shape
interface SupplierState {
	suppliers: Supplier[];
	isLoading: boolean;
	error: string | null;
}

const initialState: SupplierState = {
	suppliers: [],
	isLoading: false,
	error: null,
};

// 2. Create the SignalStore
export const SupplierStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withComputed(({ suppliers }) => ({
		suppliersCount: computed(() => suppliers().length),
		activeSuppliers: computed(() => suppliers().filter(s => s.status === Status.Active).length),

		suppliersById: computed(() => {
			const map: { [id: number]: Supplier } = {};
			for (const supplier of suppliers()) {
				map[supplier.id] = supplier;
			}
			return map;
		})

	})),

	withMethods((
		store,
		apiService = inject(ApiService),
		notificationService = inject(NotificationService),
	) => {
		const syncMethods = {

			setError(error: string): void {
				patchState(store, { error, isLoading: false });
				notificationService.toast({ severity: 'error', detail: error });
			},

			addSupplier(supplier: Supplier): void {
				patchState(store, (state) => ({
					suppliers: [...state.suppliers, supplier],
				}));
				console.log(store.suppliers())
				console.log(store.activeSuppliers())
			},

			updateSupplier(updatedSupplier: Supplier): void {
				                console.log('%cSupplierStore: Updating supplier in state:', 'color: green;', updatedSupplier); // DEBUG LOG

				patchState(store, (state) => ({
					suppliers: state.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s),
				}));
			},

			removeSupplier(supplierId: number): void {
				patchState(store, (state) => ({
					suppliers: state.suppliers.filter(s => s.id !== supplierId),
				}));
			},

			getSupplierById(id: number): Supplier | undefined {
				return store.suppliers().length > 0 ? store.suppliers().find(s => s.id === id) : undefined;
			},
		};
		const asyncMethods = {
			loadSuppliers: rxMethod<{ force?: boolean }>(
				pipe(
					filter(({ force }) => force || store.suppliers().length === 0),
					tap((res) => {
						
						patchState(store, { isLoading: true, error: null })
					}),
					switchMap(() =>
						apiService.getSuppliers().pipe(
							tap((response) => {
								if (response.success && response.result) {
									patchState(store, { suppliers: response.result, isLoading: false });
								} else {
									throw new Error(response.message || 'Failed to load suppliers');
								}
							}),
							catchError((err: HttpErrorResponse | Error) => {
								const errorMsg = err.message || 'A server error occurred';
								patchState(store, { error: errorMsg, isLoading: false });
								// notificationService.toast({ severity: 'error', detail: errorMsg });
								return of();
							})
						)
					)
				)
			),
			deleteSupplier: rxMethod<number>(
				pipe(
					// tap(() => patchState(store, { isLoading: true })),
					switchMap((supplierId) =>
						apiService.deleteSupplier(supplierId).pipe(
							tap({
								next: () => {
									// ✅ עכשיו קוראים למתודה הסינכרונית
									syncMethods.removeSupplier(supplierId);
									patchState(store, { isLoading: false });
									notificationService.toast({
										severity: 'success',
										detail: 'הספק נמחק בהצלחה',
									});
								},
							}),
							catchError((err) => {
								patchState(store, { isLoading: false, error: err.message });
								notificationService.toast({
									severity: 'error',
									detail: 'שגיאה במחיקת הספק',
								});
								return of();
							}),
						),
					),
				),
			),
			loadSupplierById: rxMethod<{ supplierId: number; force?: boolean }>( // ✅ שינוי
				pipe(
					// כאן הלוגיקה של filter קצת יותר מורכבת, כי אנחנו לא רוצים לטעון
					// אם הספק כבר קיים עם כל הפרטים. אפשר לדלג על filter כאן אם רוצים.
					tap(() => patchState(store, { isLoading: true, error: null })),
					switchMap(({ supplierId }) => // ✅ שינוי
						apiService.getSupplierById(supplierId, true).pipe(
							tap({
								next: (response) => {
									if (response.success && response.result) {
										// קוראים למתודה הסינכרונית כדי לעדכן את הספק ברשימה
										syncMethods.updateSupplier(response.result);
									} else {
										// אם השרת החזיר שגיאה לוגית, נזרוק אותה
										throw new Error(response.message || `Failed to load supplier ${supplierId}`);
									}
								}
							}),
							catchError((err) => {
								// תופסים שגיאות רשת או שגיאות שנזרקו מה-tap
								const errorMsg = err.message || 'A server error occurred';
								// מעדכנים את מצב השגיאה ב-Store. 
								// ה-Interceptor כבר הציג הודעה, אז אין צורך כאן.
								patchState(store, { error: errorMsg });
								return of(); // סיים את הזרם
							})
						)
					)
				)
			),
		};
		// --- שלב 3: החזר את כל המתודות מאוחדות ---
		return {
			...syncMethods,
			...asyncMethods,
		};
	}),
);