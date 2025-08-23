// import { Injectable, inject } from '@angular/core';
// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
// import { Observable, of } from 'rxjs';
// import { catchError, tap } from 'rxjs/operators';
// import { ApiService } from './api.service';
// import { NotificationService } from './notification.service';
// import { Product } from '../models/product';
// import { Category } from '../models/category';

// export interface CategoryGroup {
// 	categoryId: number;
// 	categoryName: string;
// 	products: Product[];
// 	id: string;
// }

// export interface ProductUpdatePayload {
// 	id: number;
// 	position: number;
// 	categoryId: number;
// }

// export interface CategoryUpdatePayload {
// 	categoryId: number;
// 	position: number;
// 	supplierId: number;
// }

// @Injectable({
// 	providedIn: 'root'
// })
// export class DragDropService {
// 	private readonly apiService = inject(ApiService);
// 	private readonly notificationService = inject(NotificationService);

// 	/**
// 	 * מטפל בגרירת מוצר בין קטגוריות או בתוך קטגוריה
// 	 * @param event אירוע הגרירה
// 	 * @param groupedProducts מערך הקטגוריות המקובצות
// 	 * @param rawProducts מערך כל המוצרים הגולמי
// 	 * @param categoryOrder סדר הקטגוריות
// 	 * @returns Observable עם המוצרים המעודכנים או null במקרה של שגיאה
// 	 */
// 	dropProduct(
// 		event: CdkDragDrop<Product[]>,
// 		groupedProducts: CategoryGroup[],
// 		rawProducts: Product[],
// 		categories: Category[]
// 	): Observable<Product[] | null> {
// 		const isSameContainer = event.previousContainer === event.container;

// 		// אם לא היה שינוי במיקום, לא צריך לעשות כלום
// 		if (isSameContainer && event.previousIndex === event.currentIndex) {
// 			return of(null);
// 		}

// 		// בצע את השינוי הויזואלי במערכים הזמניים
// 		if (isSameContainer) {
// 			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
// 		} else {
// 			transferArrayItem(
// 				event.previousContainer.data,
// 				event.container.data,
// 				event.previousIndex,
// 				event.currentIndex
// 			);
// 		}

// 		// בנה את העדכונים הנדרשים
// 		const updates = this.buildProductUpdates(event, groupedProducts, isSameContainer);

// 		if (updates.size === 0) {
// 			return of(null);
// 		}

// 		// עדכן את מקור האמת באופן אופטימי
// 		const updatedProducts = this.updateProductsOptimistically(rawProducts, updates, categories);

// 		// שלח עדכונים לשרת
// 		this.batchUpdateProducts(updates, updatedProducts).subscribe();

// 		return of(updatedProducts);
// 	}

// 	/**
// 	 * מטפל בגרירת קטגוריה ושינוי סדר הקטגוריות
// 	 * @param event אירוע הגרירה
// 	 * @param categoryOrder סדר הקטגוריות הנוכחי
// 	 * @param rawProducts מערך כל המוצרים
// 	 * @param supplierId מזהה הספק
// 	 * @returns Observable עם הנתונים המעודכנים או null במקרה של שגיאה
// 	 */
// // in drag-drop.service.ts

// public dropCategory(
//     event: CdkDragDrop<CategoryGroup[]>,
//     categoryOrder: { id: number; name: string }[], // הטיפוס הנכון
//     rawProducts: Product[],
//     supplierId: number
// ): Observable<{ categoryOrder: { id: number; name: string }[], products: Product[] } | null> {
//     if (event.previousIndex === event.currentIndex) {
//         return of(null);
//     }

//     const newCategoryOrder = [...categoryOrder];
//     moveItemInArray(newCategoryOrder, event.previousIndex, event.currentIndex);

//     const sortedProducts = [...rawProducts].sort((a, b) => {
//         // ✅ שימוש ב-findIndex עם המבנה הנכון
//         const indexA = newCategoryOrder.findIndex(cat => cat.name === a.categoryName);
//         const indexB = newCategoryOrder.findIndex(cat => cat.name === b.categoryName);
//         return indexA - indexB || a.position - b.position;
//     });

//     // הערה: שינוי סדר הקטגוריות לא אמור לשנות את ה-position של המוצרים עצמם,
//     // אלא רק את הסדר שבו הקטגוריות מוצגות.
//     // הלוגיקה לעדכון position של מוצרים שייכת ל-dropProduct.
//     // לכן, נשאיר את ה-positions של המוצרים כפי שהם.

//     const categoryUpdates: CategoryUpdatePayload[] = newCategoryOrder.map((category, index) => ({
//         categoryId: category.id, // ✅ שימוש ב-id מהאובייקט
//         position: index,
//         supplierId,
//     }));

//     // ... (הקריאה ל-API נשארת זהה)
//     this.updateCategoriesBatch(categoryUpdates).subscribe();

//     // ✅ החזרת הטיפוסים הנכונים
//     return of({
//         categoryOrder: newCategoryOrder,
//         products: rawProducts // אין צורך לעדכן את המוצרים כאן
//     });
// }

// 	/**
// 	 * שולח עדכון באצווה של מוצרים לשרת
// 	 * @param updates מפה של עדכונים למוצרים
// 	 * @param allProducts כל המוצרים עם המידע המעודכן
// 	 * @returns Observable של התגובה
// 	 */
// 	public batchUpdateProducts(
// 		updates: Map<number, Partial<Product>>,
// 		allProducts: Product[]
// 	): Observable<any> {
// 		if (updates.size === 0) {
// 			return of(null);
// 		}

// 		const updatePayload: ProductUpdatePayload[] = Array.from(updates.keys())
// 			.map(productId => {
// 				const updatedProduct = allProducts.find(p => p.id === productId);

// 				if (!updatedProduct || updatedProduct.categoryId == null || updatedProduct.position == null) {
// 					return null;
// 				}

// 				return {
// 					id: updatedProduct.id,
// 					position: updatedProduct.position,
// 					categoryId: updatedProduct.categoryId,
// 				};
// 			})
// 			.filter((p): p is ProductUpdatePayload => p !== null);

// 		if (updatePayload.length === 0) {
// 			console.warn('Batch update for products was triggered, but no valid payload was generated.');
// 			return of(null);
// 		}

// 		console.log('Sending product batch update with payload:', JSON.stringify(updatePayload, null, 2));

// 		return this.apiService.updateProductsBatch(updatePayload).pipe(
// 			tap((response) => {
// 				if (response.success) {
// 					this.notificationService.toast({
// 						severity: 'success',
// 						detail: 'סדר המוצרים עודכן בהצלחה.'
// 					});
// 				} else {
// 					this.notificationService.toast({
// 						severity: 'error',
// 						detail: response.message || 'שגיאה בעדכון סדר המוצרים.'
// 					});
// 				}
// 			}),
// 			catchError((err) => {
// 				this.notificationService.toast({
// 					severity: 'error',
// 					detail: 'שגיאה בשרת: ' + (err.error?.message || 'לא ידוע')
// 				});
// 				return of(null);
// 			})
// 		);
// 	}

// 	/**
// 	 * שולח עדכון באצווה של קטגוריות לשרת
// 	 * @param categoryUpdates מערך עדכוני הקטגוריות
// 	 * @returns Observable של התגובה
// 	 */
// 	private updateCategoriesBatch(categoryUpdates: CategoryUpdatePayload[]): Observable<any> {
// 		return this.apiService.updateCategoriesBatch(categoryUpdates).pipe(
// 			tap((response) => {
// 				if (response.success) {
// 					this.notificationService.toast({
// 						severity: 'success',
// 						detail: 'סדר הקטגוריות עודכן בהצלחה.'
// 					});
// 				} else {
// 					this.notificationService.toast({
// 						severity: 'error',
// 						detail: response.message || 'שגיאה בעדכון סדר הקטגוריות.'
// 					});
// 				}
// 			}),
// 			catchError((err) => {
// 				this.notificationService.toast({
// 					severity: 'error',
// 					detail: 'שגיאה בשרת: ' + (err.message || 'לא ידוע')
// 				});
// 				return of(null);
// 			})
// 		);
// 	}

// 	/**
// 	 * בונה את מפת העדכונים הנדרשים למוצרים
// 	 * @param event אירוע הגרירה
// 	 * @param groupedProducts קטגוריות מקובצות
// 	 * @param isSameContainer האם הגרירה הייתה באותו קונטיינר
// 	 * @returns מפה של עדכונים למוצרים
// 	 */
// 	public buildProductUpdates(
// 		event: CdkDragDrop<Product[]>,
// 		groupedProducts: CategoryGroup[],
// 		isSameContainer: boolean
// 	): Map<number, Partial<Product>> {
// 		const updates = new Map<number, Partial<Product>>();

// 		// פונקציית עזר לעדכון מוצרים בקונטיינר נתון
// 		const processContainer = (containerData: Product[], categoryId: number, categoryName: string) => {
// 			containerData.forEach((product, index) => {
// 				const hasChangedPosition = product.position !== index;
// 				const hasChangedCategory = product.categoryId !== categoryId;

// 				if (hasChangedPosition || hasChangedCategory) {
// 					const update: Partial<Product> = updates.get(product.id) || {};
// 					if (hasChangedPosition) update.position = index;
// 					if (hasChangedCategory) {
// 						update.categoryId = categoryId;
// 						update.categoryName = categoryName;
// 					}
// 					updates.set(product.id, update);
// 				}
// 			});
// 		};

// 		// עדכון קונטיינר היעד
// 		const targetGroup = groupedProducts.find(g => g.id === event.container.id);
// 		if (targetGroup) {
// 			processContainer(event.container.data, targetGroup.categoryId, targetGroup.categoryName);
// 		}

// 		// אם עברנו מקונטיינר אחר, עדכן גם את קונטיינר המקור
// 		if (!isSameContainer) {
// 			const sourceGroup = groupedProducts.find(g => g.id === event.previousContainer.id);
// 			if (sourceGroup) {
// 				processContainer(event.previousContainer.data, sourceGroup.categoryId, sourceGroup.categoryName);
// 			}
// 		}

// 		return updates;
// 	}

// 	/**
// 	 * מעדכן את המוצרים באופן אופטימי במקור האמת
// 	 * @param currentProducts המוצרים הנוכחיים
// 	 * @param updates מפת העדכונים
// 	 * @param categoryOrder סדר הקטגוריות
// 	 * @returns מערך המוצרים המעודכן
// 	 */
// 	private updateProductsOptimistically(
// 		currentProducts: Product[],
// 		updates: Map<number, Partial<Product>>,
// 		categoryOrder: Category[]
// 	): Product[] {
// 		const newProducts = currentProducts.map(p => {
// 			const update = updates.get(p.id);
// 			return update ? { ...p, ...update } : p;
// 		});

// 		// מיין את כל המערך מחדש לפי קטגוריה ומיקום
// 		return newProducts.sort((a, b) => {
// 			const catIndexA = categoryOrder.indexOf(a);
// 			const catIndexB = categoryOrder.indexOf(b);
// 			if (catIndexA !== catIndexB) {
// 				return catIndexA - catIndexB;
// 			}
// 			return a.position - b.position;
// 		});
// 	}



	
// }