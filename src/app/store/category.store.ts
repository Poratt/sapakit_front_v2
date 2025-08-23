import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, filter, catchError, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { Category } from '../common/models/category';

interface CategoryState {
	categories: Category[];
	isLoading: boolean;
	error: string | null;
	supplierId: number | null;
}

const initialState: CategoryState = {
	categories: [],
	isLoading: false,
	error: null,
	supplierId: null,
};

export const CategoryStore = signalStore(
	    { providedIn: 'root' }, 

	withState(initialState),

	withComputed(({ categories }) => ({
		categoryCount: computed(() => categories().length),
	})),

	withMethods((store, apiService = inject(ApiService), notification = inject(NotificationService)) => ({

		// --- מתודות סינכרוניות לעדכון המצב ---
		addCategory(category: Category): void {
			patchState(store, (state) => ({
				categories: [...state.categories, category]
			}));
		},
		updateCategory(updatedCategory: Category): void {
			patchState(store, (state) => ({
				categories: state.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
			}));
		},

		// --- הוספנו בחזרה את loadCategories ---
		loadCategories: rxMethod<number>(
			pipe(
				// טען רק אם המזהה חדש, או שהמערך ריק
				filter(supplierId => supplierId !== store.supplierId() || store.categories().length === 0),
				tap((supplierId) => patchState(store, { isLoading: true, supplierId, error: null })),
				switchMap((supplierId) =>
					apiService.getCategoriesBySupplier(supplierId).pipe(
						tap({
							next: (response) => {
								patchState(store, {
									categories: response.success ? (response.result || []) : [],
									isLoading: false,
									error: response.success ? null : (response.message || 'Failed to load categories')
								});
							},
							error: (err) => patchState(store, { isLoading: false, error: err.message }),
						})
					)
				)
			)
		),

		deleteCategory: rxMethod<number>(
			pipe(
				// אין צורך ב-isLoading כאן, כי המחיקה מהירה
				switchMap(categoryId =>
					apiService.deleteCategory(categoryId).pipe(
						tap(response => {
							if (response.success) {
								// אם המחיקה בשרת הצליחה, הסר מהמצב הלוקאלי
								patchState(store, (state) => ({
									categories: state.categories.filter(c => c.id !== categoryId)
								}));
								notification.toast({ severity: 'success', detail: 'קטגוריה נמחקה בהצלחה' });
							} else {
								// אם השרת החזיר שגיאה עסקית (למשל, "לא ניתן למחוק קטגוריה עם מוצרים")
								notification.toast({ severity: 'error', detail: response.message || 'שגיאה במחיקת קטגוריה' });
							}
						}),
						// catchError(err => {
						// 	// אם הייתה שגיאת רשת
						// 	// notification.toast({ severity: 'error', detail: 'אירעה שגיאה קריטית במחיקה' });
						// 	return of(null); // החזר Observable ריק כדי למנוע קריסה
						// })
					)
				)
			)
		),


		



	}))
);