import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateOrderDto } from '../common/dto/order-create.dto';
import { OrderStatus } from '../common/enums/order-status.enum';
import { OrderBySupplierDateParams } from '../common/dto/order-by-supplier-date.dto';
import { OrdersByRangeParams } from '../common/dto/orders-by-range.dto';
import { Category } from '../common/models/category';
import { Insight } from '../common/models/insight';
import { Order } from '../common/models/order';
import { Product } from '../common/models/product';
import { ServiceResultContainer } from '../common/models/serviceResultContainer';
import { DashboardStats } from '../common/models/statistics';
import { Supplier } from '../common/models/supplier';
import { User } from '../common/models/user';

export interface OrderSuggestion {
	productId: number;
	averageQuantity: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// Users
	getUsers(): Observable<ServiceResultContainer<User[]>> {
		return this.http.get<ServiceResultContainer<User[]>>(`${this.apiUrl}/users`);

	}

	register(formData: FormData): Observable<ServiceResultContainer<null>> {
		return this.http.post<ServiceResultContainer<null>>(`${this.apiUrl}/users/register`, formData);

	}

	updateUser(id: number, formData: FormData): Observable<ServiceResultContainer<User>> {
		return this.http.put<ServiceResultContainer<User>>(`${this.apiUrl}/users/${id}`, formData);

	}

	deleteUser(id: number): Observable<ServiceResultContainer<void>> {
		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/users/${id}`);

	}

	// +++++++++
	// Suppliers
	getSuppliers(): Observable<ServiceResultContainer<Supplier[]>> {
		return this.http.get<ServiceResultContainer<Supplier[]>>(`${this.apiUrl}/suppliers`, {});

	}

	getSupplierById(id: number, includeProducts: boolean = false): Observable<ServiceResultContainer<Supplier>> {
		const params = new URLSearchParams({ includeProducts: includeProducts.toString() });
		return this.http.get<ServiceResultContainer<Supplier>>(`${this.apiUrl}/suppliers/${id}?${params}`);

	}

	addSupplier(supplier: Partial<Supplier>): Observable<ServiceResultContainer<Supplier>> {
		return this.http.post<ServiceResultContainer<Supplier>>(`${this.apiUrl}/suppliers`, supplier);

	}

	updateSupplier(
		id: number,
		updatedSupplier: Partial<Supplier>,
	): Observable<ServiceResultContainer<Supplier>> {
		return this.http.put<
			ServiceResultContainer<Supplier>
		>(`${this.apiUrl}/suppliers/${id}`, updatedSupplier);

	}

	deleteSupplier(id: number): Observable<ServiceResultContainer<void>> {
		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/suppliers/${id}`);

	}

	// +++++++++
	// Products
	getProductsBySupplier(
		supplierId: number,
	): Observable<ServiceResultContainer<(Product & { categoryName?: string })[]>> {
		return this.http.get<
			ServiceResultContainer<(Product & { categoryName?: string })[]>
		>(`${this.apiUrl}/products?supplierId=${supplierId}`);

	}

	addProduct(
		product: Partial<Product>,
	): Observable<ServiceResultContainer<Product & { categoryName?: string }>> {
		return this.http.post<
			ServiceResultContainer<Product & { categoryName?: string }>
		>(`${this.apiUrl}/products`, product);

	}

	updateProduct(id: number, updatedProduct: Partial<Product>): Observable<ServiceResultContainer<Product>> {
		return this.http.put<ServiceResultContainer<Product>>(`${this.apiUrl}/products/${id}`, updatedProduct);
	}

	deleteProduct(id: number): Observable<ServiceResultContainer<void>> {
		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/products/${id}`);
	}

	// ++++++++++
	// Categories
	getCategoriesBySupplier(supplierId: number): Observable<ServiceResultContainer<Category[]>> {
		return this.http.get<
			ServiceResultContainer<Category[]>
		>(`${this.apiUrl}/categories?supplierId=${supplierId}`);

	}

	createCategory(category: Partial<Category>): Observable<ServiceResultContainer<Category>> {
		return this.http.post<ServiceResultContainer<Category>>(`${this.apiUrl}/categories`, category);

	}

	updateCategory(id: number, category: Partial<Category>): Observable<ServiceResultContainer<Category>> {
		return this.http.put<ServiceResultContainer<Category>>(`${this.apiUrl}/categories/${id}`, category);

	}

	deleteCategory(id: number): Observable<ServiceResultContainer<void>> {
		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/categories/${id}`);
	}

	updateProductsBatch(updates: { id: number; position: number; categoryId: number }[]): Observable<ServiceResultContainer<Product[]>> {
		return this.http.put<ServiceResultContainer<Product[]>>(
			`${this.apiUrl}/products/batch`,
			updates
		);
	}
	updateCategoriesBatch(updates: { categoryId: number; position: number; supplierId: number }[]): Observable<ServiceResultContainer<Category[]>> {
		return this.http.put<ServiceResultContainer<Category[]>>(
			`${this.apiUrl}/categories/batch`,
			updates
		);
	}


	// --- Orders ---
	/**
	 * Creates a new order or updates an existing one.
	 */
	createOrUpdateOrder(orderDto: CreateOrderDto): Observable<ServiceResultContainer<Order | null>> {
		return this.http.post<ServiceResultContainer<Order | null>>(`${this.apiUrl}/orders`, orderDto);
	}

	/**
	 * Retrieves all orders matching a given set of statuses.
	 */
	findOrdersByStatus(statuses: OrderStatus[]): Observable<ServiceResultContainer<Order[]>> {
		const statusString = statuses.join(',');
		return this.http.get<ServiceResultContainer<Order[]>>(
			`${this.apiUrl}/orders/by-status?statuses=${statusString}`
		);
	}

	/**
	 * Finds a single order by supplier ID and date.
	 */
	findOrderBySupplierAndDate(params: OrderBySupplierDateParams): Observable<ServiceResultContainer<Order | null>> {
		const httpParams = new HttpParams()
			.set('supplierId', params.supplierId.toString())
			.set('date', params.date);
		return this.http.get<ServiceResultContainer<Order | null>>(`${this.apiUrl}/orders/find`, { params: httpParams });
	}

	/**
	 * Retrieves a list of orders for multiple suppliers within a date range.
	 */
	findOrdersBySuppliersAndDateRange(params: OrdersByRangeParams): Observable<ServiceResultContainer<Order[]>> {
		const httpParams = new HttpParams()
			.set('supplierIds', params.supplierIds.join(','))
			.set('startDate', params.startDate)
			.set('endDate', params.endDate);
		return this.http.get<ServiceResultContainer<Order[]>>(`${this.apiUrl}/orders/in-date-range`, { params: httpParams });
	}

	/**
	 * Gets the order schedule status for multiple suppliers over a date range.
	 * Used by the calendar component.
	 */
	getOrderSchedules(params: OrdersByRangeParams): Observable<ServiceResultContainer<any>> {
		const httpParams = new HttpParams()
			.set('supplierIds', params.supplierIds.join(','))
			.set('startDate', params.startDate)
			.set('endDate', params.endDate);
		return this.http.get<ServiceResultContainer<any>>(`${this.apiUrl}/orders/schedules`, { params: httpParams });
	}

	getOrderSuggestions(
		supplierId: number,
		date: Date,
		mode: 'general' | 'daySpecific'
	): Observable<ServiceResultContainer<OrderSuggestion[]>> {
		const params = new HttpParams()
			.set('supplierId', supplierId.toString())
			.set('date', date.toISOString().split('T')[0])
			.set('mode', mode)
			.set('limit', '10'); // The limit is now on the server side

		return this.http.get<ServiceResultContainer<OrderSuggestion[]>>(
			`${this.apiUrl}/orders/suggestions`, { params }
		);
	}


	// --- Stats ---
	getDashboardKpis(): Observable<ServiceResultContainer<DashboardStats>> {
		return this.http.get<ServiceResultContainer<DashboardStats>>(`${this.apiUrl}/statistics/dashboard-kpis`);
	}



	// --- Insight ---
	getInsights(): Observable<ServiceResultContainer<null>> {
		return this.http.get<ServiceResultContainer<null>>(`${this.apiUrl}/insights/trigger-daily`);
	}

	getUnreadInsights(): Observable<ServiceResultContainer<Insight[]>> {
		return this.http.get<ServiceResultContainer<Insight[]>>(`${this.apiUrl}/insights`);
	}

	markInsightAsRead(id: number): Observable<ServiceResultContainer<null>> {
		return this.http.post<ServiceResultContainer<null>>(`${this.apiUrl}/insights/${id}/mark-as-read`, {});
	}


}

// public handleResponse<T>(
// 	response: ServiceResultContainer<T>,
// 	successAction: (result: T) => void,
// 	errorSeverity: 'error' | 'warn' = 'error',
// 	defaultErrorMessage: string,
// ) {
// 	if (response.success && response.result !== null) {
// 		successAction(response.result);
// 	} else {
// 		this.notificationService.toast({
// 			severity: errorSeverity,
// 			summary: 'שגיאה',
// 			detail: response.message || defaultErrorMessage,
// 		});
// 	}
// }