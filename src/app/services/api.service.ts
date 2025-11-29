import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Account } from '../common/models/account';
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
import { CreateUserDto } from '../common/dto/user-create.dto';
import { AccountTier } from '../common/models/account-tier.model';

export interface OrderSuggestion {
  productId: number;
  averageQuantity: number;
}

// Moved from component to avoid circular dependency
export interface SystemKpis {
  totalAccounts: number;
  newAccountsLast30Days: number;
  totalUsers: number;
  totalOrdersLast30Days: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- Accounts ---

  getAllAccountsWithUsers(): Observable<ServiceResultContainer<Account[]>> {
    const url = `${this.apiUrl}/accounts/with-users`;
    return this.http.get<ServiceResultContainer<Account[]>>(url);
  }

  updateAccount(accountId: number, payload: { tier: AccountTier }): Observable<ServiceResultContainer<Account>> {
    const url = `${this.apiUrl}/accounts/${accountId}`;
    return this.http.put<ServiceResultContainer<Account>>(url, payload);
  }

  deleteAccount(accountId: number): Observable<ServiceResultContainer<void>> {
    const url = `${this.apiUrl}/accounts/${accountId}`;
    return this.http.delete<ServiceResultContainer<void>>(url);
  }

  // --- Tiers ---

  getTiersConfig(): Observable<ServiceResultContainer<AccountTier[]>> {
    const url = `${this.apiUrl}/tiers/config`;
    return this.http.get<ServiceResultContainer<AccountTier[]>>(url);
  }

  getAllTiers(): Observable<ServiceResultContainer<AccountTier[]>> {
    const url = `${this.apiUrl}/tiers`;
    return this.http.get<ServiceResultContainer<AccountTier[]>>(url);
  }

  createTier(tier: Partial<AccountTier>): Observable<ServiceResultContainer<AccountTier>> {
    const url = `${this.apiUrl}/tiers`;
    return this.http.post<ServiceResultContainer<AccountTier>>(url, tier);
  }

  updateTier(id: number, tier: Partial<AccountTier>): Observable<ServiceResultContainer<AccountTier>> {
    const url = `${this.apiUrl}/tiers/${id}`;
    return this.http.put<ServiceResultContainer<AccountTier>>(url, tier);
  }

  deleteTier(id: number): Observable<ServiceResultContainer<void>> {
    const url = `${this.apiUrl}/tiers/${id}`;
    return this.http.delete<ServiceResultContainer<void>>(url);
  }

  // --- Users ---

  getUsers(): Observable<ServiceResultContainer<User[]>> {
    const url = `${this.apiUrl}/users`;
    return this.http.get<ServiceResultContainer<User[]>>(url);
  }

  bulkInsertUsers(users: Partial<User>[]): Observable<ServiceResultContainer<User[]>> {
    const url = `${this.apiUrl}/users/bulk`;
    return this.http.post<ServiceResultContainer<User[]>>(url, users);
  }

  // New Account
  register(newUser: CreateUserDto): Observable<ServiceResultContainer<User>> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<ServiceResultContainer<User>>(url, newUser);
  }

  // New User
  addUser(formData: FormData): Observable<ServiceResultContainer<User>> {
    const url = `${this.apiUrl}/users/add`;
    return this.http.post<ServiceResultContainer<User>>(url, formData);
  }

  updateUser(id: number, formData: FormData): Observable<ServiceResultContainer<User>> {
    const url = `${this.apiUrl}/users/${id}`;
    return this.http.put<ServiceResultContainer<User>>(url, formData);
  }

  deleteUser(id: number): Observable<ServiceResultContainer<void>> {
    const url = `${this.apiUrl}/users/${id}`;
    return this.http.delete<ServiceResultContainer<void>>(url);
  }

  // --- Suppliers ---

  getSuppliers(): Observable<ServiceResultContainer<Supplier[]>> {
    const url = `${this.apiUrl}/suppliers`;
    return this.http.get<ServiceResultContainer<Supplier[]>>(url, {});
  }

  getSupplierById(id: number, includeProducts: boolean = false): Observable<ServiceResultContainer<Supplier>> {
    const params = new HttpParams().set('includeProducts', includeProducts.toString());
    const url = `${this.apiUrl}/suppliers/${id}`;
    return this.http.get<ServiceResultContainer<Supplier>>(url, { params });
  }

  addSupplier(supplier: Partial<Supplier>): Observable<ServiceResultContainer<Supplier>> {
    const url = `${this.apiUrl}/suppliers`;
    return this.http.post<ServiceResultContainer<Supplier>>(url, supplier);
  }

  updateSupplier(id: number, updatedSupplier: Partial<Supplier>): Observable<ServiceResultContainer<Supplier>> {
    const url = `${this.apiUrl}/suppliers/${id}`;
    return this.http.put<ServiceResultContainer<Supplier>>(url, updatedSupplier);
  }

  deleteSupplier(id: number): Observable<ServiceResultContainer<void>> {
    const url = `${this.apiUrl}/suppliers/${id}`;
    return this.http.delete<ServiceResultContainer<void>>(url);
  }

  // --- Products ---

  getProductsBySupplier(supplierId: number): Observable<ServiceResultContainer<(Product & { categoryName?: string })[]>> {
    const url = `${this.apiUrl}/products`;
    const params = new HttpParams().set('supplierId', supplierId.toString());
    return this.http.get<ServiceResultContainer<(Product & { categoryName?: string })[]>>(url, { params });
  }

  addProduct(product: Partial<Product>): Observable<ServiceResultContainer<Product & { categoryName?: string }>> {
    const url = `${this.apiUrl}/products`;
    return this.http.post<ServiceResultContainer<Product & { categoryName?: string }>>(url, product);
  }

  updateProduct(id: number, updatedProduct: Partial<Product>): Observable<ServiceResultContainer<Product>> {
    const url = `${this.apiUrl}/products/${id}`;
    return this.http.put<ServiceResultContainer<Product>>(url, updatedProduct);
  }

  deleteProduct(id: number): Observable<ServiceResultContainer<void>> {
    const url = `${this.apiUrl}/products/${id}`;
    return this.http.delete<ServiceResultContainer<void>>(url);
  }

  updateProductsBatch(
    updates: { id: number; position: number; categoryId: number }[]
  ): Observable<ServiceResultContainer<Product[]>> {
    const url = `${this.apiUrl}/products/batch`;
    return this.http.put<ServiceResultContainer<Product[]>>(url, updates);
  }

  // --- Categories ---

  getCategoriesBySupplier(supplierId: number): Observable<ServiceResultContainer<Category[]>> {
    const url = `${this.apiUrl}/categories`;
    const params = new HttpParams().set('supplierId', supplierId.toString());
    return this.http.get<ServiceResultContainer<Category[]>>(url, { params });
  }

  createCategory(category: Partial<Category>): Observable<ServiceResultContainer<Category>> {
    const url = `${this.apiUrl}/categories`;
    return this.http.post<ServiceResultContainer<Category>>(url, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<ServiceResultContainer<Category>> {
    const url = `${this.apiUrl}/categories/${id}`;
    return this.http.put<ServiceResultContainer<Category>>(url, category);
  }

  deleteCategory(id: number): Observable<ServiceResultContainer<void>> {
    const url = `${this.apiUrl}/categories/${id}`;
    return this.http.delete<ServiceResultContainer<void>>(url);
  }

  updateCategoriesBatch(
    updates: { categoryId: number; position: number; supplierId: number }[]
  ): Observable<ServiceResultContainer<Category[]>> {
    const url = `${this.apiUrl}/categories/batch`;
    return this.http.put<ServiceResultContainer<Category[]>>(url, updates);
  }

  // --- Orders ---

  createOrUpdateOrder(orderDto: CreateOrderDto): Observable<ServiceResultContainer<Order | null>> {
    const url = `${this.apiUrl}/orders`;
    return this.http.post<ServiceResultContainer<Order | null>>(url, orderDto);
  }

  findOrdersByStatus(statuses: OrderStatus[]): Observable<ServiceResultContainer<Order[]>> {
    const statusString = statuses.join(',');
    const url = `${this.apiUrl}/orders/by-status`;
    const params = new HttpParams().set('statuses', statusString);
    return this.http.get<ServiceResultContainer<Order[]>>(url, { params });
  }

  findOrderBySupplierAndDate(params: OrderBySupplierDateParams): Observable<ServiceResultContainer<Order | null>> {
    const url = `${this.apiUrl}/orders/find`;
    const httpParams = new HttpParams()
      .set('supplierId', params.supplierId.toString())
      .set('date', params.date);
    return this.http.get<ServiceResultContainer<Order | null>>(url, { params: httpParams });
  }

  findOrdersBySuppliersAndDateRange(params: OrdersByRangeParams): Observable<ServiceResultContainer<Order[]>> {
    const url = `${this.apiUrl}/orders/in-date-range`;
    const httpParams = new HttpParams()
      .set('supplierIds', params.supplierIds.join(','))
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);
    return this.http.get<ServiceResultContainer<Order[]>>(url, { params: httpParams });
  }

  getOrderSchedules(params: OrdersByRangeParams): Observable<ServiceResultContainer<any>> {
    const url = `${this.apiUrl}/orders/schedules`;
    const httpParams = new HttpParams()
      .set('supplierIds', params.supplierIds.join(','))
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);
    return this.http.get<ServiceResultContainer<any>>(url, { params: httpParams });
  }

  getOrderSuggestions(
    supplierId: number,
    date: Date,
    mode: 'general' | 'daySpecific'
  ): Observable<ServiceResultContainer<OrderSuggestion[]>> {
    const url = `${this.apiUrl}/orders/suggestions`;
    const params = new HttpParams()
      .set('supplierId', supplierId.toString())
      .set('date', date.toISOString().split('T')[0])
      .set('mode', mode)
      .set('limit', '10');

    return this.http.get<ServiceResultContainer<OrderSuggestion[]>>(url, { params });
  }

  uploadZipFile(file: File, supplierId: number): Observable<ServiceResultContainer<any>> {
    const url = `${this.apiUrl}/orders/upload-zip`;
    const formData = new FormData();
    formData.append('zipFile', file);

    const params = new HttpParams()
      .set('supplierId', supplierId.toString())
      .set('minMatchThreshold', '70')
      .set('minMatchedRatio', '0.6');

    return this.http.post<ServiceResultContainer<any>>(url, formData, { params });
  }

  deleteSupplierOrders(supplierId: number): Observable<any> {
    console.log(`🗑️ API: Deleting orders for supplier: ${supplierId}`);
    const url = `${this.apiUrl}/orders/supplier/${supplierId}`;
    return this.http.delete(url);
  }

  // --- Stats ---

  getDashboardKpis(): Observable<ServiceResultContainer<DashboardStats>> {
    const url = `${this.apiUrl}/statistics/dashboard-kpis`;
    return this.http.get<ServiceResultContainer<DashboardStats>>(url);
  }

  getSystemKpis(): Observable<ServiceResultContainer<SystemKpis>> {
    const url = `${this.apiUrl}/admin/kpis`;
    return this.http.get<ServiceResultContainer<SystemKpis>>(url);
  }

  // --- Insight ---

  getInsights(): Observable<ServiceResultContainer<null>> {
    const url = `${this.apiUrl}/insights/trigger-daily`;
    return this.http.get<ServiceResultContainer<null>>(url);
  }

  getUnreadInsights(): Observable<ServiceResultContainer<Insight[]>> {
    const url = `${this.apiUrl}/insights`;
    return this.http.get<ServiceResultContainer<Insight[]>>(url);
  }

  markInsightAsRead(id: number): Observable<ServiceResultContainer<null>> {
    const url = `${this.apiUrl}/insights/${id}/mark-as-read`;
    return this.http.post<ServiceResultContainer<null>>(url, {});
  }
}





// import { Account } from './../common/models/account';
// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';
// import { CreateOrderDto } from '../common/dto/order-create.dto';
// import { OrderStatus } from '../common/enums/order-status.enum';
// import { OrderBySupplierDateParams } from '../common/dto/order-by-supplier-date.dto';
// import { OrdersByRangeParams } from '../common/dto/orders-by-range.dto';
// import { Category } from '../common/models/category';
// import { Insight } from '../common/models/insight';
// import { Order } from '../common/models/order';
// import { Product } from '../common/models/product';
// import { ServiceResultContainer } from '../common/models/serviceResultContainer';
// import { DashboardStats } from '../common/models/statistics';
// import { Supplier } from '../common/models/supplier';
// import { User } from '../common/models/user';
// import { CreateUserDto } from '../common/dto/user-create.dto';
// import { SystemKpis } from '../components/admin/admin-dashboard-component/admin-dashboard-component.component';
// import { AccountTier } from '../common/models/account-tier.model';


// export interface OrderSuggestion {
// 	productId: number;
// 	averageQuantity: number;
// }

// @Injectable({ providedIn: 'root' })
// export class ApiService {
// 	private http = inject(HttpClient);
// 	private apiUrl = environment.apiUrl;

// 	//Accounts
// 	getAllAccountsWithUsers(): Observable<ServiceResultContainer<Account[]>> {
// 		return this.http.get<ServiceResultContainer<Account[]>>(`${this.apiUrl}/accounts/with-users`);
// 	}

// 	updateAccount(accountId: number, payload: { tier: AccountTier }): Observable<ServiceResultContainer<Account>> {
// 		return this.http.put<ServiceResultContainer<Account>>(`${this.apiUrl}/accounts/${accountId}`, payload);
// 	}

// 	deleteAccount(accountId: number): Observable<ServiceResultContainer<void>> {
// 		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/accounts/${accountId}`);
// 	}
	
// 	// Tiers
// 	getTiersConfig(): Observable<ServiceResultContainer<AccountTier[]>> {
// 		return this.http.get<ServiceResultContainer<AccountTier[]>>(`${this.apiUrl}/tiers/config`);
// 	}

// 	getAllTiers(): Observable<ServiceResultContainer<AccountTier[]>> {
// 		return this.http.get<ServiceResultContainer<AccountTier[]>>(`${this.apiUrl}/tiers`);
// 	}

// 	createTier(tier: Partial<AccountTier>): Observable<ServiceResultContainer<AccountTier>> {
// 		return this.http.post<ServiceResultContainer<AccountTier>>(`${this.apiUrl}/tiers`, tier);
// 	}

// 	updateTier(id: number, tier: Partial<AccountTier>): Observable<ServiceResultContainer<AccountTier>> {
// 		return this.http.put<ServiceResultContainer<AccountTier>>(`${this.apiUrl}/tiers/${id}`, tier);
// 	}

// 	deleteTier(id: number): Observable<ServiceResultContainer<void>> {
// 		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/tiers/${id}`);
// 	}

// 	// Users
// 	getUsers(): Observable<ServiceResultContainer<User[]>> {
// 		return this.http.get<ServiceResultContainer<User[]>>(`${this.apiUrl}/users`);
// 	}

// 	bulkInsertUsers(users: Partial<User>[]): Observable<ServiceResultContainer<User[]>> {
//         return this.http.post<ServiceResultContainer<User[]>>(`${this.apiUrl}/users/bulk`, users);
//     }
	
// 	//New Account
// 	register(newUser: CreateUserDto): Observable<ServiceResultContainer<User>> {
// 		return this.http.post<ServiceResultContainer<User>>(`${this.apiUrl}/auth/register`, newUser);
// 	}

// 	// New User
// 	addUser(formData: FormData): Observable<ServiceResultContainer<User>> {
// 		return this.http.post<ServiceResultContainer<User>>(`${this.apiUrl}/users/add`, formData);
// 	}

// 	updateUser(id: number, formData: FormData): Observable<ServiceResultContainer<User>> {
// 		return this.http.put<ServiceResultContainer<User>>(`${this.apiUrl}/users/${id}`, formData);
// 	}

// 	deleteUser(id: number): Observable<ServiceResultContainer<void>> {
// 		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/users/${id}`);
// 	}


// 	// Suppliers
// 	getSuppliers(): Observable<ServiceResultContainer<Supplier[]>> {
// 		return this.http.get<ServiceResultContainer<Supplier[]>>(`${this.apiUrl}/suppliers`, {});
// 	}

// 	getSupplierById(id: number, includeProducts: boolean = false): Observable<ServiceResultContainer<Supplier>> {
// 		const params = new URLSearchParams({ includeProducts: includeProducts.toString() });
// 		return this.http.get<ServiceResultContainer<Supplier>>(`${this.apiUrl}/suppliers/${id}?${params}`);
// 	}

// 	addSupplier(supplier: Partial<Supplier>): Observable<ServiceResultContainer<Supplier>> {
// 		return this.http.post<ServiceResultContainer<Supplier>>(`${this.apiUrl}/suppliers`, supplier);
// 	}

// 	updateSupplier(id: number, updatedSupplier: Partial<Supplier>): Observable<ServiceResultContainer<Supplier>> {
// 		return this.http.put<ServiceResultContainer<Supplier>>(`${this.apiUrl}/suppliers/${id}`, updatedSupplier);
// 	}

// 	deleteSupplier(id: number): Observable<ServiceResultContainer<void>> {
// 		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/suppliers/${id}`);
// 	}

// 	// Products
// 	getProductsBySupplier(supplierId: number): Observable<ServiceResultContainer<(Product & { categoryName?: string })[]>> {
// 		return this.http.get<ServiceResultContainer<(Product & { categoryName?: string })[]>>(`${this.apiUrl}/products?supplierId=${supplierId}`);

// 	}

// 	addProduct(
// 		product: Partial<Product>): Observable<ServiceResultContainer<Product & { categoryName?: string }>> {
// 		return this.http.post<ServiceResultContainer<Product & { categoryName?: string }>>(`${this.apiUrl}/products`, product);
// 	}

// 	updateProduct(id: number, updatedProduct: Partial<Product>): Observable<ServiceResultContainer<Product>> {
// 		return this.http.put<ServiceResultContainer<Product>>(`${this.apiUrl}/products/${id}`, updatedProduct);
// 	}

// 	deleteProduct(id: number): Observable<ServiceResultContainer<void>> {
// 		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/products/${id}`);
// 	}


// 	// Categories
// 	getCategoriesBySupplier(supplierId: number): Observable<ServiceResultContainer<Category[]>> {
// 		return this.http.get<ServiceResultContainer<Category[]>>(`${this.apiUrl}/categories?supplierId=${supplierId}`);
// 	}

// 	createCategory(category: Partial<Category>): Observable<ServiceResultContainer<Category>> {
// 		return this.http.post<ServiceResultContainer<Category>>(`${this.apiUrl}/categories`, category);
// 	}

// 	updateCategory(id: number, category: Partial<Category>): Observable<ServiceResultContainer<Category>> {
// 		return this.http.put<ServiceResultContainer<Category>>(`${this.apiUrl}/categories/${id}`, category);
// 	}

// 	deleteCategory(id: number): Observable<ServiceResultContainer<void>> {
// 		return this.http.delete<ServiceResultContainer<void>>(`${this.apiUrl}/categories/${id}`);
// 	}

// 	updateProductsBatch(updates: { id: number; position: number; categoryId: number }[]): Observable<ServiceResultContainer<Product[]>> {
// 		return this.http.put<ServiceResultContainer<Product[]>>(`${this.apiUrl}/products/batch`, updates);
// 	}
// 	updateCategoriesBatch(updates: { categoryId: number; position: number; supplierId: number }[]): Observable<ServiceResultContainer<Category[]>> {
// 		return this.http.put<ServiceResultContainer<Category[]>>(`${this.apiUrl}/categories/batch`, updates);
// 	}


// 	// --- Orders ---
// 	createOrUpdateOrder(orderDto: CreateOrderDto): Observable<ServiceResultContainer<Order | null>> {
// 		return this.http.post<ServiceResultContainer<Order | null>>(`${this.apiUrl}/orders`, orderDto);
// 	}

// 	findOrdersByStatus(statuses: OrderStatus[]): Observable<ServiceResultContainer<Order[]>> {
// 		const statusString = statuses.join(',');
// 		return this.http.get<ServiceResultContainer<Order[]>>(`${this.apiUrl}/orders/by-status?statuses=${statusString}`
// 		);
// 	}

// 	/*** Finds a single order by supplier ID and date. */
// 	findOrderBySupplierAndDate(params: OrderBySupplierDateParams): Observable<ServiceResultContainer<Order | null>> {
// 		const httpParams = new HttpParams()
// 			.set('supplierId', params.supplierId.toString())
// 			.set('date', params.date);
// 		return this.http.get<ServiceResultContainer<Order | null>>(`${this.apiUrl}/orders/find`, { params: httpParams });
// 	}

// 	/*** Retrieves a list of orders for multiple suppliers within a date range. */
// 	findOrdersBySuppliersAndDateRange(params: OrdersByRangeParams): Observable<ServiceResultContainer<Order[]>> {
// 		const httpParams = new HttpParams()
// 			.set('supplierIds', params.supplierIds.join(','))
// 			.set('startDate', params.startDate)
// 			.set('endDate', params.endDate);
// 		return this.http.get<ServiceResultContainer<Order[]>>(`${this.apiUrl}/orders/in-date-range`, { params: httpParams });
// 	}

// 	/*** Gets the order schedule status for multiple suppliers over a date range. Used by the calendar component. */
// 	getOrderSchedules(params: OrdersByRangeParams): Observable<ServiceResultContainer<any>> {
// 		const httpParams = new HttpParams()
// 			.set('supplierIds', params.supplierIds.join(','))
// 			.set('startDate', params.startDate)
// 			.set('endDate', params.endDate);
// 		return this.http.get<ServiceResultContainer<any>>(`${this.apiUrl}/orders/schedules`, { params: httpParams });
// 	}

// 	getOrderSuggestions(
// 		supplierId: number,
// 		date: Date,
// 		mode: 'general' | 'daySpecific'
// 	): Observable<ServiceResultContainer<OrderSuggestion[]>> {
// 		const params = new HttpParams()
// 			.set('supplierId', supplierId.toString())
// 			.set('date', date.toISOString().split('T')[0])
// 			.set('mode', mode)
// 			.set('limit', '10'); // The limit is now on the server side

// 		return this.http.get<ServiceResultContainer<OrderSuggestion[]>>(
// 			`${this.apiUrl}/orders/suggestions`, { params }
// 		);
// 	}

// 	uploadZipFile(file: File, supplierId: number): Observable<ServiceResultContainer<any>> { // שנה את שם המתודה
// 		const formData = new FormData();
// 		formData.append('zipFile', file); // שנה את שם השדה

// 		const params = new HttpParams()
// 			.set('supplierId', supplierId.toString())
// 			.set('minMatchThreshold', '70')
// 			.set('minMatchedRatio', '0.6');

// 		// שנה את הנתיב
// 		return this.http.post<ServiceResultContainer<any>>(`${this.apiUrl}/orders/upload-zip`, formData, { params });
// 	}

// 	// API Service
// 	deleteSupplierOrders(supplierId: number): Observable<any> {
// 		console.log(`🗑️ API: Deleting orders for supplier: ${supplierId}`);

// 		return this.http.delete(`${this.apiUrl}/orders/supplier/${supplierId}`);
// 	}

// 	// --- Stats ---
// 	getDashboardKpis(): Observable<ServiceResultContainer<DashboardStats>> {
// 		return this.http.get<ServiceResultContainer<DashboardStats>>(`${this.apiUrl}/statistics/dashboard-kpis`);
// 	}
// 	getSystemKpis(): Observable<ServiceResultContainer<SystemKpis>> {
// 		return this.http.get<ServiceResultContainer<SystemKpis>>(`${this.apiUrl}/admin/kpis`);
// 	}



// 	// --- Insight ---
// 	getInsights(): Observable<ServiceResultContainer<null>> {
// 		return this.http.get<ServiceResultContainer<null>>(`${this.apiUrl}/insights/trigger-daily`);
// 	}

// 	getUnreadInsights(): Observable<ServiceResultContainer<Insight[]>> {
// 		return this.http.get<ServiceResultContainer<Insight[]>>(`${this.apiUrl}/insights`);
// 	}

// 	markInsightAsRead(id: number): Observable<ServiceResultContainer<null>> {
// 		return this.http.post<ServiceResultContainer<null>>(`${this.apiUrl}/insights/${id}/mark-as-read`, {});
// 	}


// }

// // public handleResponse<T>(
// // 	response: ServiceResultContainer<T>,
// // 	successAction: (result: T) => void,
// // 	errorSeverity: 'error' | 'warn' = 'error',
// // 	defaultErrorMessage: string,
// // ) {
// // 	if (response.success && response.result !== null) {
// // 		successAction(response.result);
// // 	} else {
// // 		this.notificationService.toast({
// // 			severity: errorSeverity,
// // 			summary: 'שגיאה',
// // 			detail: response.message || defaultErrorMessage,
// // 		});
// // 	}
// // }