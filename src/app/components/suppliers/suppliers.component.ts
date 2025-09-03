import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeComponent } from '../shared/badge/badge.component';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
import { DialogService } from 'primeng/dynamicdialog';

// App Components
import { LoaderComponent } from '../shared/loader/loader.component';
import { SupplierDialogComponent } from '../dialogs/supplier-dialog/supplier-dialog.component';

// App Services & Stores
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ExcelExportService, ExportColumn } from '../../services/excel-export.service';
import { SupplierStore } from '../../store/supplier.store';

// Models, Enums, Consts & Pipes

import { statusData } from '../../common/enums/status.enum';
import { orderTypeData } from '../../common/enums/order-type';
import { reminderTypeData } from '../../common/enums/reminderType';
import { HebrewDayPipe } from '../../pipes/hebrewDay.pipe';
import { fadeIn400, crossFade } from '../../common/const/animations';
import { DialogConfig } from '../../common/const/dialog-config';
import { PageStates } from '../../common/models/pageStates';
import { Supplier } from '../../common/models/supplier';
import { AuthStore } from '../../store/auth.store';
import { AccountTier } from '../../common/enums/account-tier.enums';
import { TierManagementService } from '../../services/tier-management.service';

@Component({
	selector: 'app-suppliers',
	standalone: true,
	imports: [
		CommonModule,
		RouterLink,
		FormsModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		ConfirmDialogModule,
		BadgeComponent,
		TooltipModule,
		MessageModule,
		LoaderComponent,
		ChipModule,
		HebrewDayPipe,
	],
	templateUrl: './suppliers.component.html',
	styleUrls: ['./suppliers.component.css'],
	providers: [DialogService], // DialogService נדרש ל-SupplierDialogComponent
	animations: [fadeIn400, crossFade],
})
export class SuppliersComponent implements OnInit {
	private readonly notificationService = inject(NotificationService);
	private readonly dialogService = inject(DialogService);
	private readonly excelExportService = inject(ExcelExportService);
	private readonly supplierStore = inject(SupplierStore);
	private readonly authStore = inject(AuthStore);
	private readonly tierService = inject(TierManagementService); 

	readonly searchQuery = signal('');

	readonly AccountTier = AccountTier;

	readonly PageStates = signal(PageStates);
	readonly pageState = computed(() => {
		if (this.supplierStore.isLoading()) return PageStates.Loading;
		if (this.supplierStore.error()) return PageStates.Error;
		if (this.suppliers().length === 0) return PageStates.Empty;
		return PageStates.Ready;
	});

	readonly statusData = statusData;
	readonly orderTypeData = orderTypeData;
	readonly reminderTypeData = reminderTypeData;

	readonly suppliers = this.supplierStore.suppliers;
    readonly suppliersCount = computed(() => this.suppliers().length);
    readonly accountTier = computed(() => this.authStore.user()?.account?.tier); 
	readonly supplierLimit = this.tierService.getLimitFor('suppliers');
	readonly hasReachedSupplierLimit = this.tierService.hasReachedLimit('suppliers');
    readonly tooltipMessage = this.tierService.getTooltipMessage('suppliers'); // <-- שימוש במתודה החדשה


	// --- Computed Signals ---
	readonly filteredSuppliers = computed(() => {
		const allSuppliers = this.suppliers();
		const query = this.searchQuery().toLowerCase();

		if (!query) {
			return allSuppliers;
		}
		return allSuppliers.filter((s) =>
			s.name.toLowerCase().includes(query) ||
			s.phone.toLowerCase().includes(query) ||
			s.email?.toLowerCase().includes(query)
		);
	});

	// --- Lifecycle ---
	ngOnInit() {
		this.supplierStore.loadSuppliers({});
	}

	public refreshData(): void {
		this.supplierStore.loadSuppliers({ force: true });
	}
	// --- User Actions ---
	addSupplier(): void {
		const ref = this.dialogService.open(SupplierDialogComponent, {
			...DialogConfig,
			header: 'הוספת ספק חדש',
			data: { suppliers: this.suppliers() },
		});

		ref.onClose.subscribe((newSupplier: Supplier | undefined) => {
			if (newSupplier) {
				// קריאה ל-API מתבצעת בתוך הדיאלוג, כאן רק נעדכן את ה-Store
				this.supplierStore.addSupplier(newSupplier);
				// this.notificationService.toast({ severity: 'success', detail: 'הספק נוסף בהצלחה' });
			}
		});
	}

	editSupplier(supplier: Supplier, event: MouseEvent): void {
		event.stopPropagation()
		const ref = this.dialogService.open(SupplierDialogComponent, {
			...DialogConfig,
			header: `עריכת ספק | ${supplier.name}`,
			data: { supplier, suppliers: this.suppliers() },
		});

		ref.onClose.subscribe((updatedSupplier: Supplier | undefined) => {
			if (updatedSupplier) {
				this.supplierStore.updateSupplier(updatedSupplier);
				// this.notificationService.toast({ severity: 'success', detail: 'הספק עודכן בהצלחה' });
			}
		});
	}

	confirmDelete(supplier: Supplier, event: MouseEvent): void {
		event.stopPropagation()
		this.notificationService.confirm({
			message: `האם אתה בטוח שברצונך למחוק את הספק "${supplier.name}"?`,
			header: ' מחיקת ספק',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'מחק',
		}).subscribe((accepted) => {
			if (accepted) {
				this.deleteSupplier(supplier);
			}
		});
	}

	// private deleteSupplier(supplier: Supplier): void {
	// 	this.apiService.deleteSupplier(supplier.id).subscribe({
	// 		next: () => {
	// 			this.supplierStore.removeSupplier(supplier.id);
	// 			this.notificationService.toast({ severity: 'success', detail: 'הספק נמחק בהצלחה.' });
	// 		},
	// 		error: () => {
	// 			this.notificationService.toast({ severity: 'error', detail: 'לא ניתן למחוק ספק.' });
	// 		},
	// 	});
	// }

	private deleteSupplier(supplier: Supplier): void {
		this.supplierStore.deleteSupplier(supplier.id);
	}

	// --- Export to Excel ---
	exportSuppliers(): void {
		const columns = this.getSupplierExportColumns();
		const dataToExport = this.filteredSuppliers();
		this.excelExportService.exportToExcel(dataToExport, columns, {
			fileName: 'רשימת_ספקים',
			sheetName: 'ספקים',
			includeTimestamp: true,
		});
	}

	private getSupplierExportColumns(): ExportColumn[] {
		return [
			{ key: 'name', header: 'שם' },
			{ key: 'phone', header: 'טלפון' },
			{ key: 'status', header: 'סטטוס', transform: ExcelExportService.transformers.enumToText(this.statusData) },
			{ key: 'orderType', header: 'סוג הזמנה', transform: ExcelExportService.transformers.enumToText(this.orderTypeData) },
			{
				key: 'orderDays',
				header: 'מועדי הזמנה',
				transform: (row: Supplier) => {
					const hebrewDays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
					const days = (row.orderDays || []).map((day: number) => hebrewDays[day] || '').join(', ');
					const dates = (row.orderDates || []).map(d => d.toString()).join(', ');
					return [days, dates].filter(Boolean).join(' | ');
				},
			},
			{ key: 'reminderType', header: 'סוג תזכורת', transform: ExcelExportService.transformers.enumToText(this.reminderTypeData) },
			{ key: 'createdAt', header: 'תאריך יצירה', transform: ExcelExportService.transformers.dateFormat('short') },
		];
	}
}