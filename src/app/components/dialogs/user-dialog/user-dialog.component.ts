import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Status, statusData } from '../../../common/enums/status.enum';
import { fadeIn400 } from '../../../common/const/animations';
import { detailedPasswordValidator, markFormGroupTouched } from '../../../common/const/custom-validators';
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { UserRole, userRoleData } from '../../../common/enums/userRole.enum';
import { environment } from '../../../../environments/environment';
import { User } from '../../../common/models/user';
import { CreateUserDto } from '../../../common/dto/user-create.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore } from '../../../store/auth.store';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordInputComponent } from '../../shared/password-input/password-input.component';

@Component({
	selector: 'app-user-dialog',
	templateUrl: './user-dialog.component.html',
	styleUrl: './user-dialog.component.css',
	animations: [fadeIn400],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonModule,
		InputTextModule,
		SelectModule,
		SelectButtonModule,
		ToastModule,
		ProgressSpinnerModule,
		ToggleSwitchModule,
		PasswordInputComponent,
	],
})
export class UserDialogComponent {
	private fb = inject(FormBuilder);
	private ref = inject(DynamicDialogRef);
	private config = inject(DynamicDialogConfig);
	private notificationService = inject(NotificationService);
	private apiService = inject(ApiService);

	private readonly authStore = inject(AuthStore);

	readonly isCurrentUserAdmin = computed(() => this.authStore.user()?.role === UserRole.Admin);

	@ViewChild('emailRef') emailRef!: ElementRef;
	@ViewChild('passwordInputComp') passwordInputComp!: PasswordInputComponent; 

	statusData = statusData;
	Status = Status;
	userRoleData = userRoleData.slice(1);
	backendUrl = environment.apiUrl;

	imagePreview = signal<string | null>(null);
	isDraggingOver = signal<boolean>(false);
	isImageLoading = signal<boolean>(false);
	formSubmitted = signal<boolean>(false);
	public readonly passwordLength = signal(8);

	readonly isDisabled = computed(() => { return this.isCurrentUserAdmin() && this.id.value === 0; });

	constructor() {
		effect(() => {
			// const disabled = this.isDisabled();
			// if (disabled) {
			// 	this.role.disable();
			// } else {
			// 	this.role.enable();
			// }
			this.role.disable()
		});
	}

	userForm: FormGroup = this.fb.group({
		id: [0],
		username: ['', Validators.required],
		status: [Status.Active, Validators.required],
		phone: ['', Validators.pattern(/^\+?\d{10,12}$/)],
		email: ['', [Validators.required, Validators.email]],
		role: ['', Validators.required],
		password: ['', [Validators.required, detailedPasswordValidator()]],
		image: [null],
	});

	get id(): AbstractControl {
		return this.userForm.get('id') as AbstractControl<number>;
	}
	get username(): AbstractControl {
		return this.userForm.get('username') as AbstractControl<string>;
	}
	get status(): AbstractControl {
		return this.userForm.get('status') as AbstractControl<Status>;
	}
	get phone(): AbstractControl {
		return this.userForm.get('phone') as AbstractControl<string>;
	}
	get password(): AbstractControl {
		return this.userForm.get('password') as AbstractControl<string>;
	}
	get email(): AbstractControl {
		return this.userForm.get('email') as AbstractControl<string>;
	}
	get role(): AbstractControl {
		return this.userForm.get('role') as AbstractControl<UserRole>;
	}
	get image(): AbstractControl {
		return this.userForm.get('image') as AbstractControl<File | null>;
	}

	ngOnInit() {
		const userToEdit = this.config.data?.user;

		if (userToEdit) { 
			this.userForm.removeControl('password');
			this.patchForm(userToEdit);
		} 
		else { 
			this.status.disable();

			// ✅ התיקון הקריטי כאן
			if (this.isCurrentUserAdmin()) {
				// אם המשתמש המחובר הוא Admin, קבע את התפקיד כ-User ונטרל את השדה
				this.role.setValue(UserRole.User);
				this.role.disable();
			}
		}

		setTimeout(() => {
			if (this.emailRef) {
				this.emailRef.nativeElement.focus();
			}
		});
	}

	patchForm(user: User) {
		console.log(`userId: ${user.id}`);

		this.userForm.patchValue({
			id: user.id ?? 0,
			username: user.username,
			status: user.id ? user.status : Status.Active,
			phone: user.phone,
			email: user.email,
			role: user.role,
			image: null,
		});
		if (user.image && user.image !== '/Uploads/undefined') {
			console.log(user.image);
			this.imagePreview.set(this.getImageUrl(user.image));
		}
	}

	getImageUrl(image: string): string {
		if (!image) return '';
		if (image.startsWith('http')) return image;
		return `${this.backendUrl}${image}`;
	}

	onDragOver(event: DragEvent) {
		event.preventDefault();
		this.isDraggingOver.set(true);
	}

	onDragLeave(event: DragEvent) {
		event.preventDefault();
		this.isDraggingOver.set(false);
	}

	onDrop(event: DragEvent) {
		event.preventDefault();
		this.isDraggingOver.set(false);
		const file = event.dataTransfer?.files[0];
		if (file) {
			this.handleImageFile(file);
		}
	}

	onImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			this.handleImageFile(file);
		}
	}

	private handleImageFile(file: File) {
		if (!file.type.startsWith('image/')) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'נא להעלות קובץ תמונה (PNG, JPG, GIF)',
			});
			return;
		}
		if (file.size > 5000000) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'גודל התמונה חייב להיות עד 5MB',
			});
			return;
		}
		this.isImageLoading.set(true);
		setTimeout(() => {
			this.image.setValue(file);
			const reader = new FileReader();
			reader.onload = () => {
				this.imagePreview.set(reader.result as string);
				this.isImageLoading.set(false);
			};
			reader.readAsDataURL(file);
		}, 500); // סימולציה קצרה לטעינה
	}

	onRemoveFile() {
		this.image.setValue(null);
		this.imagePreview.set(null);
	}

	formatSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	onSave(): void {
		this.formSubmitted.set(true);
		markFormGroupTouched(this.userForm);

		if (this.password && this.passwordInputComp) {
			this.passwordInputComp.markAsTouched();
		}
		
		if (this.userForm.invalid) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'יש למלא את כל השדות המסומנים באדום',
			});
			return;
		}

		// 1. Build the FormData object
		const formData = this.createFormData();

		// 2. Determine if it's an update or a new registration
		if (this.id.value) {
			this.updateExistingUser(this.id.value, formData);
		} else {
			this.registerNewUser(formData);
		}
	}

	private createFormData(): FormData {
		const formData = new FormData();
		const formValue = this.userForm.getRawValue();;
		console.log(formValue);

		// Append core fields
		formData.append('email', formValue.email);
		formData.append('username', formValue.username);
		formData.append('role', formValue.role.toString());
		formData.append('status', formValue.status.toString());

		// Append optional fields only if they have a value
		if (formValue.phone) {
			formData.append('phone', formValue.phone);
		}
		if (formValue.password) {
			formData.append('password', formValue.password);
		}
		if (formValue.image instanceof File) {
			formData.append('image', formValue.image, formValue.image.name);
		}

		console.log("--- FormData Content ---");
		for (let [key, value] of formData.entries()) {
			console.log(`${key}:`, value);
		}
		console.log("------------------------");

		return formData;
	}

	private updateExistingUser(id: number, formData: FormData): void {
		this.apiService.updateUser(id, formData).subscribe({
			next: (response) => {
				if (response.success && response.result) {
					this.ref.close(response.result);
				} else {
					this.notificationService.toast({ severity: 'error', detail: response.message });
				}
			},
			error: (err: HttpErrorResponse) => {
				this.notificationService.toast({
					severity: 'error',
					detail: err.error?.message || 'שגיאה בעדכון המשתמש',
				});
			}
		});
	}

	private registerNewUser(formData: FormData): void {
		this.apiService.addUser(formData).subscribe({
			next: (response) => {
				if (response.success && response.result) {
					this.ref.close(response.result);
				} else {
					this.notificationService.toast({ severity: 'warn', detail: response.message || 'הפעולה לא הצליחה' });
				}
			},
			error: (err: HttpErrorResponse) => {
				this.notificationService.toast({
					severity: 'error',
					detail: err.error?.message || 'שגיאה לא צפויה אירעה'
				});
			}
		});
	}

	onCancel() {
		this.ref.close();
	}

	toggleStatus(): void {
		this.status.setValue(this.status.value === Status.Active ? Status.Inactive : Status.Active);
	}
}