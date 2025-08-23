import { Component, signal, inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../services/notification.service';
import { CategoryStore } from '../../../store/category.store';
import { ApiService } from '../../../services/api.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Category } from '../../../common/models/category';

@Component({
	selector: 'app-category-dialog',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		TooltipModule,
		InputIcon, 
		IconField
	],
	templateUrl: './category-dialog.component.html',
	styleUrls: ['./category-dialog.component.css'],
	providers: [],
})
export class CategoryDialogComponent implements OnInit {
	// --- Injections ---
	private readonly store = inject(CategoryStore);
	private readonly config = inject(DynamicDialogConfig);
	private apiService = inject(ApiService);
	private readonly notificationService = inject(NotificationService);
	private readonly cdr = inject(ChangeDetectorRef);
	readonly ref = inject(DynamicDialogRef);

	// --- ViewChild ---
	@ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

	// --- Signals ---
	readonly categories = this.store.categories;
	readonly isLoading = this.store.isLoading;
	newCategoryName = signal('');
	editingCategoryId = signal<number | null>(null);

	private readonly supplierId: number;

	constructor() {
		this.supplierId = this.config.data?.supplierId;
		if (!this.supplierId) {
			this.notificationService.toast({ severity: 'error', detail: 'מזהה ספק לא סופק' });
			this.ref.close();
		}
	}

	ngOnInit(): void {
		this.store.loadCategories(this.supplierId);
	}

	editCategory(category: Category): void {
		this.editingCategoryId.set(category.id);
		this.newCategoryName.set(category.name);
		this.focusInput();
	}

	cancelEdit(): void {
		this.editingCategoryId.set(null);
		this.newCategoryName.set('');
	}

	private focusInput(): void {
		this.cdr.detectChanges(); // ודא שה-DOM התעדכן והשדה 
		setTimeout(() => this.inputRef?.nativeElement.focus(), 0);
	}


	addCategory(): void { // נפריד בין הוספה לעדכון
		const name = this.newCategoryName().trim();
		if (!name) return;

		const payload: Partial<Category> = { name, supplierId: this.supplierId };

		this.apiService.createCategory(payload).subscribe(response => {
			if (response.success && response.result) {
				this.notificationService.toast({ severity: 'success', detail: 'קטגוריה נוספה' });
				// סגור את הדיאלוג והחזר את הקטגוריה החדשה
				this.ref.close(response.result);
			} else {
				this.notificationService.toast({ severity: 'error', detail: response.message });
			}
		});
	}

	saveEditedCategory(): void { // פונקציה נפרדת לעדכון
		const editingId = this.editingCategoryId();
		const name = this.newCategoryName().trim();
		if (!editingId || !name) return;

		const payload: Partial<Category> = { name, supplierId: this.supplierId };

		this.apiService.updateCategory(editingId, payload).subscribe(response => {
			if (response.success && response.result) {
				// רק עדכן את ה-store. אין צורך לסגור את הדיאלוג
				this.store.updateCategory(response.result);
				this.notificationService.toast({ severity: 'success', detail: 'קטגוריה עודכנה' });
				this.cancelEdit();
			} else {
				this.notificationService.toast({ severity: 'error', detail: response.message });
			}
		});
	}

	confirmDelete(category: Category): void {
		this.notificationService.confirm({
			message: `האם אתה בטוח שברצונך למחוק את הקטגוריה "${category.name}"?`,
			header: 'מחיקת קטגוריה',
		}).subscribe(accepted => {
			if (accepted) {
				this.store.deleteCategory(category.id);
			}
		});
	}
}