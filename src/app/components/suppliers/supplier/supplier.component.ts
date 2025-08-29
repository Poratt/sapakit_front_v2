import { CdkDragDrop, CdkDragMove, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { fadeIn400 } from '../../../common/const/animations';
import { DialogConfig } from '../../../common/const/dialog-config';
import { PackageData } from '../../../common/enums/package';
import { statusData } from '../../../common/enums/status.enum';

import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { ProductDialogComponent } from '../../dialogs/product-dialog/product-dialog.component';
import { TableModule } from 'primeng/table';
import { ScrollService } from '../../../services/scroll.service';
import { ReminderTypePipe } from "../../../pipes/package.pipe";
import { SupplierDialogComponent } from '../../dialogs/supplier-dialog/supplier-dialog.component';
import { SupplierStore } from '../../../store/supplier.store';
import { Category } from '../../../common/models/category';
import { PageStates } from '../../../common/models/pageStates';
import { Product } from '../../../common/models/product';
import { Supplier } from '../../../common/models/supplier';
import { AuthStore } from '../../../store/auth.store';
import { FileUploadModule } from 'primeng/fileupload';

export interface CategoryGroup {
	categoryId: number;
	categoryName: string;
	products: Product[];
	id: string;
}

@Component({
	selector: 'app-supplier',
	standalone: true,
	imports: [
		CommonModule, ButtonModule, DialogModule, ConfirmDialogModule, RouterModule, TooltipModule,
		InputTextModule, LoaderComponent, MessageModule, FormsModule, BadgeComponent, DragDropModule, TableModule,
		ReminderTypePipe, FileUploadModule
	],
	templateUrl: './supplier.component.html',
	styleUrls: ['./supplier.component.css'],
	providers: [DialogService, ConfirmationService, MessageService],
	animations: [fadeIn400],
})
export class SupplierComponent {
	// --- Stores & Services ---
	private readonly supplierStore = inject(SupplierStore);
	private readonly apiService = inject(ApiService);
	private readonly dialogService = inject(DialogService);
	private readonly route = inject(ActivatedRoute);
	private readonly notificationService = inject(NotificationService);
	private readonly scrollService = inject(ScrollService);

	@ViewChild('dragZone', { static: false }) dragZone!: ElementRef;

	// --- Static Data ---
	readonly PageStates = PageStates;
	readonly packageData = PackageData;
	readonly statusData = statusData;

	// --- Core State ---
	pageState = signal(PageStates.Loading);
	supplier = signal<Supplier | undefined>(undefined);
	searchQuery = signal('');

	private readonly rawProducts = signal<Product[]>([]);
	public readonly categories = signal<Category[]>([]);
	public itemToDelete = signal<number | undefined>(undefined);

	// --- Derived View State ---
	readonly groupedProducts = computed<CategoryGroup[]>(() => {
		const products = this.rawProducts();
		const categories = this.categories();
		const query = this.searchQuery().toLowerCase();

		const productsByCat = new Map<number, Product[]>();
		products.forEach(p => {
			const catId = p.categoryId ?? -1;
			if (!productsByCat.has(catId)) productsByCat.set(catId, []);
			productsByCat.get(catId)!.push(p);
		});

		productsByCat.forEach(prods => prods.sort((a, b) => a.position - b.position));

		return categories.map(category => {
			const groupProducts = productsByCat.get(category.id) || [];
			const filteredProducts = query ? groupProducts.filter(p => p.name.toLowerCase().includes(query)) : groupProducts;
			return {
				categoryId: category.id,
				categoryName: category.name,
				products: filteredProducts,
				id: `category-${category.id}`
			};
		}).filter(group => (query ? group.products.length > 0 : true));
	});

	readonly hasProducts = computed(() => this.rawProducts().length > 0);
	readonly productListIds = computed<string[]>(() => this.groupedProducts().map(g => g.id));

	constructor() {
		this.route.paramMap.subscribe((params) => {
			const id = Number(params.get('supplierId'));
			if (id > 0) this.loadInitialData(id);
			else this.handleLoadError('מזהה ספק לא תקין.');
		});
	}

	private loadInitialData(id: number): void {
		this.pageState.set(PageStates.Loading);
		this.apiService.getSupplierById(id, true).subscribe({
			next: (response) => {
				if (response.success && response.result) {
					const supplier = response.result;
					const products = supplier.products || [];
					const categories = supplier.categories || [];
					categories.sort((a, b) => a.position - b.position);
					console.log(products);

					this.rawProducts.set(products);
					this.categories.set(categories);
					this.supplier.set(supplier);
					this.pageState.set(PageStates.Ready);
				} else {
					this.handleLoadError(response.message || 'הספק לא נמצא.');
				}
			},
			error: () => this.handleLoadError('אירעה שגיאה בעת טעינת פרטי הספק.'),
		});
	}

	private handleLoadError(message: string): void {
		this.rawProducts.set([]);
		this.categories.set([]);
		this.supplier.set(undefined);
		this.pageState.set(PageStates.Error);
		this.notificationService.toast({ severity: 'error', detail: message });
	}

	addProduct(): void {
		const supplierId = this.supplier()?.id;
		if (!supplierId) return;

		this.dialogService.open(ProductDialogComponent, {
			...DialogConfig,
			header: 'הוספת מוצר חדש',
			data: { supplierId, products: this.rawProducts(), categories: this.categories() },
		}).onClose.subscribe((newProduct: Product | undefined) => {
			if (newProduct) {
				this.rawProducts.update(current => [...current, newProduct]);
			}
		});
	}

	addProductToCategory(categoryId: number, categoryName: string): void {
		const supplierId = this.supplier()?.id;
		if (!supplierId) return;

		this.dialogService.open(ProductDialogComponent, {
			...DialogConfig,
			header: `הוספת מוצר חדש | ${categoryName}`,
			data: { supplierId, categoryId, categoryName, products: this.rawProducts(), categories: this.categories() },
		}).onClose.subscribe((newProduct: Product | undefined) => {
			if (newProduct) {
				this.rawProducts.update(current => [...current, newProduct]);
			}
		});
	}

	editProduct(product: Product): void {
		this.dialogService.open(ProductDialogComponent, {
			...DialogConfig, header: `עריכת מוצר | ${product.name}`,
			data: { product, products: this.rawProducts(), categories: this.categories() },
		}).onClose.subscribe((updatedProduct: Product | undefined) => {
			if (updatedProduct) {
				this.rawProducts.update(products => {
					const index = products.findIndex(p => p.id === updatedProduct.id);
					const newProducts = [...products];
					if (index > -1) newProducts[index] = updatedProduct;
					return newProducts;
				});
			}
		});
	}

	confirmDelete(product: Product): void {
		this.itemToDelete.set(product.id);
		this.notificationService.confirm({
			message: `האם למחוק את המוצר "${product.name}"?`,
			header: 'מחיקת מוצר',
			icon: 'pi pi-trash',
		}).subscribe((accepted) => {
			if (accepted) this.deleteProduct(product.id);
			this.itemToDelete.set(undefined);
		});
	}

	private deleteProduct(id: number): void {
		this.apiService.deleteProduct(id).subscribe({
			next: (response) => {
				if (response.success) {
					this.rawProducts.update(products => products.filter(p => p.id !== id));
					this.notificationService.toast({ severity: 'success', detail: 'המוצר נמחק בהצלחה.' });
				} else {
					this.notificationService.toast({ severity: 'error', detail: response.message });
				}
			},
		});
	}

	editSupplier(): void {
		const ref = this.dialogService.open(SupplierDialogComponent, {
			...DialogConfig,
			header: `עריכת ספק | ${this.supplier()?.name}`,
			data: { supplier: this.supplier(), suppliers: this.supplierStore.suppliers() },
		});
		ref.onClose.subscribe((updatedSupplier: Supplier | undefined) => {
			if (updatedSupplier) {
				this.supplierStore.updateSupplier(updatedSupplier);
				this.supplier.set(updatedSupplier);
			}
		});
	}

	dropProduct(event: CdkDragDrop<Product[]>): void {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
		}

		const updates = new Map<number, Partial<Product>>();
		this.groupedProducts().forEach(group => {
			group.products.forEach((product, index) => {
				if (product.position !== index || product.categoryId !== group.categoryId) {
					updates.set(product.id, {
						position: index,
						categoryId: group.categoryId,
						categoryName: group.categoryName,
					});
				}
			});
		});

		if (updates.size === 0) return;

		this.rawProducts.update(currentProducts => {
			return currentProducts.map(p => {
				const update = updates.get(p.id);
				return update ? { ...p, ...update } : p;
			});
		});

		this.batchUpdateProducts(updates);
	}

	private batchUpdateProducts(updates: Map<number, Partial<Product>>): void {
		const payload = Array.from(updates.keys()).map(productId => {
			const update = updates.get(productId)!;
			return { id: productId, position: update.position!, categoryId: update.categoryId! };
		});

		this.apiService.updateProductsBatch(payload).subscribe({
			next: (response) => {
				if (!response.success) {
					this.notificationService.toast({ severity: 'error', detail: response.message });
					this.loadInitialData(this.supplier()!.id);
				} else {
					this.notificationService.toast({ severity: 'success', detail: response.message });
				}
			},
			error: (err) => {
				this.notificationService.toast({ severity: 'error', detail: err.error?.message });
				this.loadInitialData(this.supplier()!.id);
			}
		});
	}

	dropCategory(event: CdkDragDrop<CategoryGroup[]>): void {
		if (event.previousIndex === event.currentIndex) return;

		const supplierId = this.supplier()?.id;
		if (!supplierId) return;

		const previousOrder = this.categories();
		const newOrder = [...previousOrder];
		moveItemInArray(newOrder, event.previousIndex, event.currentIndex);

		this.categories.set(newOrder);

		const payload = newOrder.map((category, index) => ({
			categoryId: category.id,
			position: index,
			supplierId: supplierId,
		}));

		this.apiService.updateCategoriesBatch(payload).subscribe({
			next: (response) => {
				if (response.success && response.result) {
					this.notificationService.toast({ severity: 'success', detail: response.message });
					this.categories.set(response.result);
				} else {
					this.notificationService.toast({ severity: 'error', detail: response.message });
					this.categories.set(previousOrder);
				}
			},
			error: (err) => {
				this.notificationService.toast({ severity: 'error', detail: err.error?.message });
				this.categories.set(previousOrder);
			}
		});
	}


	onDragMoved(event: CdkDragMove): void { this.scrollService.onDragMoved(event, this.dragZone); }
	onDragReleased(): void { this.scrollService.stopAutoScroll(); }
	
}