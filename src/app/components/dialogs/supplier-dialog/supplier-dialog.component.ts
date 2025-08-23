import { Component, inject, signal } from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { Status, statusData } from '../../../common/enums/status.enum';
import { ReminderType, reminderTypeData } from '../../../common/enums/reminderType';
import { MatTabsModule } from '@angular/material/tabs';
import { fadeIn400 } from '../../../common/const/animations';
import { OrderType, orderTypeData } from '../../../common/enums/order-type';
import { markFormGroupTouched } from '../../../common/const/custom-validators';
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { ServiceResultContainer } from '../../../common/models/serviceResultContainer';
import { Supplier } from '../../../common/models/supplier';


export function orderSelectionValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		if (!(control instanceof FormGroup)) {
			return null;
		}
		const formGroup = control as FormGroup;
		const orderType = formGroup.get('orderType')?.value;
		const orderDays = formGroup.get('orderDays') as FormArray;
		const orderDates = formGroup.get('orderDates') as FormArray;
		if (orderType === OrderType.ByDay && orderDays.length === 0) {
			// console.log('Validation error: No days selected');
			return { minSelection: true };
		}
		if (orderType === OrderType.ByDate && orderDates.length === 0) {
			// console.log('Validation error: No dates selected');
			return { minSelection: true };
		}
		return null;
	};
}

@Component({
	selector: 'app-supplier-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonModule,
		InputTextModule,
		SelectModule,
		SelectButtonModule,
		MatTabsModule,
		ToastModule,
	],
	templateUrl: './supplier-dialog.component.html',
	styleUrl: './supplier-dialog.component.css',
	animations: [fadeIn400,
		
	],
})
export class SupplierDialogComponent {
	private fb = inject(FormBuilder);
	private ref = inject(DynamicDialogRef);
	private config = inject(DynamicDialogConfig);
	private notificationService = inject(NotificationService);
	private apiService = inject(ApiService);

	statusData = statusData;
	Status = Status;
	OrderTypes = OrderType;
	orderTypeData = orderTypeData;
	reminderTypeData = reminderTypeData;

	formSubmitted = signal<boolean>(false);

	supplierForm: FormGroup = this.fb.group(
		{
			id: [0],
			name: ['', Validators.required],
			status: [Status.Active, Validators.required],
			phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,12}$/)]],
			orderType: [OrderType.ByDay, Validators.required],
			orderDays: this.fb.array([]),
			orderDates: this.fb.array([]),
			reminderType: [ReminderType.EachTime, Validators.required],
			email: ['', [Validators.email]],
			image: [''],
		},
		{ validators: orderSelectionValidator() },
	);

	get id(): AbstractControl {
		return this.supplierForm.get('id') as AbstractControl<number>;
	}
	get name(): AbstractControl {
		return this.supplierForm.get('name') as AbstractControl<string>;
	}
	get status(): AbstractControl {
		return this.supplierForm.get('status') as AbstractControl<Status>;
	}
	get phone(): AbstractControl {
		return this.supplierForm.get('phone') as AbstractControl<string>;
	}
	get orderType(): AbstractControl {
		return this.supplierForm.get('orderType') as AbstractControl<OrderType>;
	}
	get orderDays(): FormArray {
		return this.supplierForm.get('orderDays') as FormArray;
	}
	get orderDates(): FormArray {
		return this.supplierForm.get('orderDates') as FormArray;
	}
	get reminderType(): AbstractControl {
		return this.supplierForm.get('reminderType') as AbstractControl<ReminderType>;
	}
	get email(): AbstractControl {
		return this.supplierForm.get('email') as AbstractControl<string | null>;
	}
	get image(): AbstractControl {
		return this.supplierForm.get('image') as AbstractControl<string | null>;
	}

	daysOptions = [
		{ label: 'ראשון', short: "א'", value: 0 },
		{ label: 'שני', short: "ב'", value: 1 },
		{ label: 'שלישי', short: "ג'", value: 2 },
		{ label: 'רביעי', short: "ד'", value: 3 },
		{ label: 'חמישי', short: "ה'", value: 4 },
		{ label: 'שישי', short: "ו'", value: 5 },
		{ label: 'שבת', short: "ש'", value: 6 },
	];

	datesOptions = Array.from({ length: 31 }, (_, i) => ({
		label: `${i + 1}`,
		value: i + 1,
	}));

	selectedTabIndex: number = 0;

	ngOnInit() {
		const supplier = this.config.data?.supplier;
		if (!supplier || supplier.id === 0) {
			this.status.disable();
		}

		if (supplier && supplier.id) {
			this.patchForm(supplier);
		}
	}

	patchForm(supplier: Supplier) {
		this.selectedTabIndex = supplier.orderType === OrderType.ByDay ? 0 : 1;
		const orderDaysArray = this.supplierForm.get('orderDays') as FormArray;
		(supplier.orderDays || []).forEach((day) => {
			orderDaysArray.push(this.fb.control(day));
		});

		const orderDatesArray = this.supplierForm.get('orderDates') as FormArray;
		(supplier.orderDates || []).forEach((date) => {
			orderDatesArray.push(this.fb.control(date));
		});

		this.supplierForm.patchValue({
			id: supplier.id,
			name: supplier.name,
			status: supplier.id ? supplier.status : Status.Active,
			phone: supplier.phone,
			orderType: supplier.orderType,
			reminderType: supplier.reminderType,
			email: supplier.email,
			image: supplier.image,
		});
	}

	onTabChange(activeTabIndex: number): void {
		this.selectedTabIndex = activeTabIndex;
		const orderType = activeTabIndex === 0 ? OrderType.ByDay : OrderType.ByDate;
		this.supplierForm.get('orderType')?.setValue(orderType);

		const arrayToClear = activeTabIndex === 0 ? this.orderDates : this.orderDays;
		arrayToClear.clear();

		this.orderDays.markAsPristine();
		this.orderDays.markAsUntouched();
		this.orderDates.markAsPristine();
		this.orderDates.markAsUntouched();
	}

	toggleSelection(arrayName: 'orderDays' | 'orderDates', value: number) {
		const formArray = this.supplierForm.get(arrayName) as FormArray;
		const index = formArray.value.indexOf(value);

		if (arrayName === 'orderDates') {
			if (index !== -1) {
				// כבר קיים – הסר אותו
				formArray.removeAt(index);
			} else {
				// לא קיים – אם יש כבר 5 תאריכים, הסר את הראשון
				if (formArray.length >= 5) {
					formArray.removeAt(0);
				}
				formArray.push(this.fb.control(value));
			}
		} else {
			// orderDays – רגיל
			if (index === -1) {
				formArray.push(this.fb.control(value));
			} else {
				formArray.removeAt(index);
			}
		}

		formArray.markAsDirty();
		formArray.markAsTouched();
		this.supplierForm.updateValueAndValidity();
	}



	isSelected(arrayName: 'orderDays' | 'orderDates', value: number): boolean {
		return (this.supplierForm.get(arrayName) as FormArray).value.includes(value);
	}

	shouldShowReminderType(): boolean {
		const daysLength = this.supplierForm.get('orderDays')?.value?.length || 0;
		const datesLength = this.supplierForm.get('orderDates')?.value?.length || 0;
		return daysLength > 1 || datesLength > 1;
	}

	onSave() {
		this.formSubmitted.set(true);
		markFormGroupTouched(this.supplierForm);
		this.orderDays.markAsTouched();
		this.orderDates.markAsTouched();
		this.orderDays.updateValueAndValidity();
		this.orderDates.updateValueAndValidity();
		if (this.supplierForm.invalid && this.formSubmitted()) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'יש למלא את כל השדות המסומנים באדום',
			});
			return;
		}
		const sortedOrderDays = [...this.orderDays.value].sort((a, b) => a - b);
		const sortedOrderDates = [...this.orderDates.value].sort((a, b) => a - b);

		const supplier: Supplier = {
			...this.supplierForm.value,
			orderDays: sortedOrderDays || [],
			orderDates: sortedOrderDates || [],
			status: this.status.value,
			createdAt: this.supplierForm.value.id ? undefined : new Date(),
			updatedAt: new Date(),
		};

		const suppliers = this.config.data?.suppliers || [];
		const isNameTaken = suppliers.some(
			(s: Supplier) => s.name === supplier.name && s.id !== supplier.id,
		);
		if (isNameTaken) {
			this.notificationService.toast({
				severity: 'error',
				// summary: 'שגיאה',
				detail: 'שם הספק כבר קיים',
			});
			return;
		}

		if (supplier.id) {
			this.apiService.updateSupplier(supplier.id, supplier).subscribe({
				next: (response: ServiceResultContainer<Supplier>) => {
					console.log('Update response:', response);
					if (response.success && response.result) {
						this.notificationService.toast({
							severity: 'success',
							// summary: 'עודכן',
							detail: response.message || 'הספק עודכן בהצלחה.',
						});
						const updatedSupplier = response.result;
						this.ref.close(updatedSupplier);
					} else if (response.message?.includes('שם הספק כבר קיים')) {
						this.notificationService.toast({
							severity: 'error',
							// summary: 'שגיאה',
							detail: 'שם הספק כבר קיים',
						});
					} else {
						this.notificationService.toast({
							severity: 'error',
							// summary: 'שגיאה',
							detail: response.message || 'לא ניתן לעדכן ספק.',
						});
					}
				},
				error: (err) => {
					console.error('Update error:', err);
					this.notificationService.toast({
						severity: 'error',
						// summary: 'שגיאה',
						detail: 'אירעה שגיאה בעדכון הספק.',
					});
				},
			});
		} else {
			// הוספת ספק חדש
			this.apiService.addSupplier(supplier).subscribe({
				next: (response: ServiceResultContainer<Supplier>) => {
					console.log('Add response:', response);
					if (response.success && response.result) {
						this.notificationService.toast({
							severity: 'success',
							// summary: 'נוסף',
							detail: response.message || 'הספק נוסף בהצלחה.',
						});
						const newSupplier = response.result;
						console.log('Closing dialog with new supplier:', newSupplier);
						this.ref.close(newSupplier);
					} else if (response.message?.includes('שם הספק כבר קיים')) {
						this.notificationService.toast({
							severity: 'error',
							// summary: 'שגיאה',
							detail: 'שם הספק כבר קיים',
						});
					} else {
						this.notificationService.toast({
							severity: 'error',
							// summary: 'שגיאה',
							detail: response.message || 'לא ניתן להוסיף ספק.',
						});
					}
				},
				error: (err) => {
					console.error('Add error:', err);
					this.notificationService.toast({
						severity: 'error',
						// summary: 'שגיאה',
						detail: 'אירעה שגיאה בהוספת הספק.',
					});
				},
			});
		}
	}

	isAllSelected(arrayName: 'orderDays' | 'orderDates'): boolean {
		const formArray = this.supplierForm.get(arrayName) as FormArray;
		const options = arrayName === 'orderDays' ? this.daysOptions : this.datesOptions;

		if (formArray.length === options.length) {
			const allValuesSelected = options.every((option) =>
				formArray.value.includes(option.value),
			);
			return allValuesSelected;
		}

		return false;
	}

	toggleSelectAll(arrayName: 'orderDays' | 'orderDates') {
		const formArray = this.supplierForm.get(arrayName) as FormArray;
		const options = arrayName === 'orderDays' ? this.daysOptions : this.datesOptions;

		if (this.isAllSelected(arrayName)) {
			formArray.clear();
		} else {
			formArray.clear();
			options.forEach((option) => {
				formArray.push(this.fb.control(option.value));
			});
		}

		formArray.markAsDirty();
		formArray.markAsTouched();
		this.supplierForm.updateValueAndValidity();
	}

	selectAll(arrayName: 'orderDays' | 'orderDates') {
		const formArray = this.supplierForm.get(arrayName) as FormArray;
		formArray.clear();

		const options = arrayName === 'orderDays' ? this.daysOptions : this.datesOptions;

		options.forEach((option) => {
			formArray.push(this.fb.control(option.value));
		});

		formArray.markAsDirty();
		formArray.markAsTouched();
		this.supplierForm.updateValueAndValidity();
	}

	/**
	 * מנקה את כל הבחירות במערך
	 * @param arrayName שם המערך (orderDays או orderDates)
	 */
	clearAll(arrayName: 'orderDays' | 'orderDates') {
		const formArray = this.supplierForm.get(arrayName) as FormArray;
		formArray.clear();
		formArray.markAsDirty();
		formArray.markAsTouched();
		this.supplierForm.updateValueAndValidity();
	}
	onCancel() {
		this.ref.close();
	}

	onToggleChange(event: Event): void {
		console.log(event);

		const isChecked = (event.target as HTMLInputElement).checked;
		this.status.setValue(isChecked ? Status.Active : Status.Inactive);
	}

	toggleStatus(): void {
		this.status.setValue(this.status.value == Status.Active ? Status.Inactive : Status.Active);
	}
}
