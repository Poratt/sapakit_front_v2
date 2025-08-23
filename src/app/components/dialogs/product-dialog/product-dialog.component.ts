import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';

// App Components
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

// App Services & Stores
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { CategoryStore } from '../../../store/category.store';

// Models, Enums, Consts

import { Package, PackageData } from '../../../common/enums/package';
import { Status, statusData } from '../../../common/enums/status.enum';
import { DialogConfig } from '../../../common/const/dialog-config';
import { markFormGroupTouched } from '../../../common/const/custom-validators';
import { Category } from '../../../common/models/category';
import { Product } from '../../../common/models/product';

@Component({
	selector: 'app-product-dialog',
	standalone: true,
	templateUrl: './product-dialog.component.html',
	styleUrls: ['./product-dialog.component.css'],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonModule,
		InputTextModule,
		SelectModule,
		InputNumberModule,
		TextareaModule,
		SelectButtonModule,
		TooltipModule,
	],
	providers: [DialogService],
})
export class ProductDialogComponent implements OnInit {
	// --- Injections ---
	private fb = inject(FormBuilder);
	private ref = inject(DynamicDialogRef);
	private config = inject(DynamicDialogConfig);
	private notificationService = inject(NotificationService);
	private apiService = inject(ApiService);
	private dialogService = inject(DialogService);
	private categoryStore = inject(CategoryStore);

	// --- Enums for Template ---
	readonly packageData = PackageData;
	readonly statusData = statusData;
	readonly Status = Status;

	// --- Signals ---
	readonly categories = this.categoryStore.categories;
	readonly isLoadingCategories = this.categoryStore.isLoading;

	// --- Properties ---
	private readonly supplierId: number;
	private readonly existingProduct?: Product = this.config.data?.product;
	private readonly allProducts: Product[] = this.config.data?.products || [];

	productForm: FormGroup = this.fb.group({
		id: [0],
		name: ['', Validators.required],
		categoryId: [null, Validators.required],
		package: [Package.Unit],
		cost: [null, [Validators.min(0)]],
		price: [null, [Validators.min(0)]],
		status: [{ value: Status.Active, disabled: !this.existingProduct }], // נשבית ישירות כאן
		comment: [''],
		imageUrl: [''],
		position: [0],
	});

	get f() { return this.productForm.controls }
	constructor() {
		this.supplierId = this.config.data?.supplierId || this.existingProduct?.supplierId;
		if (!this.supplierId) {
			this.notificationService.toast({ severity: 'error', detail: 'מזהה ספק לא סופק.' });
			this.ref.close();
		}
	}

	ngOnInit(): void {
		this.categoryStore.loadCategories(this.supplierId);	
		console.log(this.categories());
		
		if (this.existingProduct) {
			this.patchForm(this.existingProduct);
		} else {
			const initialCategoryId = this.config.data?.categoryId;			
			if (initialCategoryId) {
				this.productForm.patchValue({ categoryId: initialCategoryId });
			}
		}
	}

	private patchForm(product: Product): void {
		this.productForm.patchValue({
			id: product.id || 0,
			name: product.name,
			categoryId: product.categoryId,
			package: product.package || Package.Unit,
			cost: product.cost ?? null,
			price: product.price ?? null,
			status: product.status,
			comment: product.comment || '', // תיקון: notes -> comment
			imageUrl: product.imageUrl || '',
			position: product.position ?? 0,
		});
	}

	toggleStatus(): void {
		const currentStatus = this.productForm.get('status')?.value;
		const newStatus = currentStatus === Status.Active ? Status.Inactive : Status.Active;
		this.productForm.get('status')?.setValue(newStatus);
	}

	openCategoryDialog(): void {
		const dialogRef = this.dialogService.open(CategoryDialogComponent, {
			...DialogConfig,
			header: 'ניהול קטגוריות',
			data: { supplierId: this.supplierId },
		});
		dialogRef.onClose.subscribe((newCategory: Category | undefined) => {
			if (newCategory) {
				// 1. הוסף את הקטגוריה החדשה ל-Store
				this.categoryStore.addCategory(newCategory);

				// 2. בחר את ה-ID שלה בטופס
				this.productForm.patchValue({ categoryId: newCategory.id });
			}
		});
	}


onSave(): void {
	markFormGroupTouched(this.productForm);
	if(this.productForm.invalid) {
	this.notificationService.toast({ severity: 'error', detail: 'יש למלא את כל השדות המסומנים באדום' });
	return;
}

const formValue = this.productForm.getRawValue();
const isEditMode = !!formValue.id;

const productPayload: Partial<Product> = {
	...formValue,
	supplierId: this.supplierId,
	categoryName: this.categories().find(c => c.id === formValue.categoryId)?.name || 'ללא קטגוריה',
	position: isEditMode ? formValue.position : this.calculateNewPosition(formValue.categoryId),
};

if (this.isNameTaken(productPayload.name!, formValue.id)) {
	this.notificationService.toast({ severity: 'error', detail: 'קיים מוצר בשם זה' });
	return;
}

const apiCall = isEditMode
	? this.apiService.updateProduct(formValue.id, productPayload)
	: this.apiService.addProduct(productPayload);

apiCall.subscribe({
	next: (response) => {
		if (response.success && response.result) {
			const resultProduct = {
				...response.result,
				categoryName: productPayload.categoryName,
			};
			this.f['categoryId'].setValue(productPayload.categoryName)
			this.notificationService.toast({ severity: 'success', detail: response.message || 'הפעולה בוצעה בהצלחה' });
			this.ref.close(resultProduct);
		} else {
			this.notificationService.toast({ severity: 'error', detail: response.message || 'הפעולה נכשלה' });
		}
	},
	error: () => this.notificationService.toast({ severity: 'error', detail: 'אירעה שגיאה קריטית' }),
});
	}
    
    private isNameTaken(name: string, currentId: number): boolean {
	return this.allProducts.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== currentId);
}
    
    private calculateNewPosition(categoryId: number | null): number {
	const productsInSameCategory = this.allProducts.filter(p => p.categoryId === categoryId);
	return productsInSameCategory.length;
}

onCancel(): void {
	this.ref.close(null);
}
}