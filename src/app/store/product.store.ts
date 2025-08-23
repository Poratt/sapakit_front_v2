import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { catchError, filter, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { Product } from '../models/product';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { ServiceResultContainer } from '../models/serviceResultContainer';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

// Interface לעדכון אצווה, כדאי שיהיה מוגדר במקום מרכזי
export interface ProductBatchUpdatePayload {
	id: number;
	position: number;
	categoryId: number;
}

// 1. הגדרת ה-State
interface ProductState {
	products: Product[];
	isLoading: boolean;
	isMutating: boolean; // לפעולות עדכון/מחיקה
	error: string | null;
}

const initialState: ProductState = {
	products: [],
	isLoading: false,
	isMutating: false,
	error: null,
};

// 2. יצירת ה-SignalStore
export const ProductStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withComputed(({ products }) => ({
		// מחזיר Map של מוצרים לפי ID לגישה מהירה
		productsById: computed(() => {
			const map: { [id: number]: Product } = {};
			for (const product of products()) {
				map[product.id] = product;
			}
			return map;
		}),
	})),
	withMethods(
		(
			store,
			apiService = inject(ApiService),
			notificationService = inject(NotificationService),
		) => {
			// --- מתודות סינכרוניות (Updaters) ---
			const syncMethods = {
				setProducts(products: Product[]): void {
					patchState(store, { products });
				},
				addProduct(product: Product): void {
					patchState(store, (state) => ({
						products: [...state.products, product],
					}));
				},
				updateProduct(updatedProduct: Product): void {
					patchState(store, (state) => ({
						products: state.products.map((p) =>
							p.id === updatedProduct.id ? updatedProduct : p,
						),
					}));
				},
				removeProduct(productId: number): void {
					patchState(store, (state) => ({
						products: state.products.filter((p) => p.id !== productId),
					}));
				},
			};

			// --- מתודות אסינכרוניות (Effects) ---
			const asyncMethods = {
				loadProducts: rxMethod<number>( // מקבל supplierId
					pipe(
						tap(() => patchState(store, { isLoading: true, error: null })),
						switchMap((supplierId) =>
							apiService.getProductsBySupplier(supplierId).pipe(
								tap({
									next: (response: ServiceResultContainer<Product[]>) => {
										if (response.success && response.result) {
											patchState(store, { products: response.result, isLoading: false });
										} else {
											throw new Error(response.message || 'Failed to load products');
										}
									},
								}),
								catchError((err: HttpErrorResponse | Error) => {
									const errorMsg = err.message || 'A server error occurred';
									patchState(store, { products: [], error: errorMsg, isLoading: false });
									return of();
								}),
							),
						),
					),
				),

				deleteProduct: rxMethod<number>( // מקבל productId
					pipe(
						tap(() => patchState(store, { isMutating: true })),
						switchMap((productId) =>
							apiService.deleteProduct(productId).pipe(
								tap({
									next: () => {
										syncMethods.removeProduct(productId);
										patchState(store, { isMutating: false });
										notificationService.toast({
											severity: 'success',
											detail: 'המוצר נמחק בהצלחה.',
										});
									},
								}),
								catchError((err) => {
									patchState(store, { isMutating: false, error: err.message });
									notificationService.toast({
										severity: 'error',
										detail: 'שגיאה במחיקת המוצר.',
									});

									return of();
								}),
							),
						),
					),
				),

				updateProductsBatch: rxMethod<ProductBatchUpdatePayload[]>(
					pipe(
						tap(() => patchState(store, { isMutating: true })),
						switchMap((payload) =>
							apiService.updateProductsBatch(payload).pipe(
								tap({
									next: (response) => {
										// אין צורך לעדכן את המצב המקומי, כי העדכון האופטימי כבר קרה.
										// רק צריך להציג הודעה ולאפס את מצב ה-mutating.
										patchState(store, { isMutating: false });
										if (response.success) {
											notificationService.toast({
												severity: 'success',
												detail: 'סדר המוצרים עודכן בהצלחה.',
											});
										} else {
											// אם השרת נכשל, נרצה אולי לרענן את הנתונים
											// כדי לבטל את העדכון האופטימי.
											// this.loadProducts(supplierId); //  צריך להעביר את supplierId
										}
									},
								}),
								catchError((err) => {
									patchState(store, { isMutating: false, error: err.message });
									notificationService.toast({
										severity: 'error',
										detail: 'שגיאה בעדכון סדר המוצרים.',
									});
									return of();
								}),
							),
						),
					),
				),
			};

			// --- חשיפת כל המתודות ---
			return {
				...syncMethods,
				...asyncMethods,
			};
		},
	),
);