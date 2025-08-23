import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Status, statusData } from '../../../common/enums/status.enum';
import { fadeIn400 } from '../../../common/const/animations';
import { markFormGroupTouched } from '../../../common/const/custom-validators';
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { UserRole, userRoleData } from '../../../common/enums/userRole.enum';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../../environments/environment';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { User } from '../../../common/models/user';

@Component({
	selector: 'app-user-dialog',
	templateUrl: './user-dialog.component.html',
	styleUrl: './user-dialog.component.css',
	animations: [fadeIn400],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonModule,
		InputTextModule,
		SelectModule,
		SelectButtonModule,
		ToastModule,
		PasswordModule,
		ProgressSpinnerModule,
		ToggleSwitchModule,
	],
	standalone: true,
})
export class UserDialogComponent {
	private fb = inject(FormBuilder);
	private ref = inject(DynamicDialogRef);
	private config = inject(DynamicDialogConfig);
	private notificationService = inject(NotificationService);
	private apiService = inject(ApiService);

	@ViewChild('emailRef') emailRef!: ElementRef;

	statusData = statusData;
	Status = Status;
	userRoleData = userRoleData;
	backendUrl = environment.apiUrl;

	imagePreview = signal<string | null>(null);
	isDraggingOver = signal<boolean>(false);
	isImageLoading = signal<boolean>(false);
	formSubmitted = signal<boolean>(false);

	userForm: FormGroup = this.fb.group({
		id: [0],
		username: ['', Validators.required],
		status: [Status.Active, Validators.required],
		phone: ['', Validators.pattern(/^\+?\d{10,12}$/)],
		email: ['', [Validators.required, Validators.email]],
		role: ['', Validators.required],
		password: ['', [Validators.required, Validators.minLength(6)]],

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
		const user = this.config.data?.user;
		// Create user
		if (!user || user.id === 0) {
			this.status.disable();
		}
		// Edit user
		if (user && user.id) {
			this.userForm.removeControl('password');
			this.patchForm(user);
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

		if (this.userForm.invalid) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'Please fill in all required fields.',
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

		// Append core fields
		formData.append('email', formValue.email);
		formData.append('username', formValue.username);
		formData.append('role', formValue.role);
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

		return formData;
	}

	//  update an existing user.
	private updateExistingUser(id: number, formData: FormData): void {
		this.apiService.updateUser(id, formData).subscribe({
			next: (response) => {
				if (response.success) {
					this.ref.close(response.result); // Close dialog with the updated user data
				} else {
					this.notificationService.toast({ severity: 'error', detail: response.message });
				}
			},
			error: (err) => {
				this.notificationService.toast({ severity: 'error', detail: err.message });
			}
		});
	}

	//  register a new user.
	private registerNewUser(formData: FormData): void {
		this.apiService.register(formData).subscribe({
			next: (response) => {
				if (response.success) {
					this.ref.close(response.result); // Close dialog and signal success to refresh the list
				} else {
					this.notificationService.toast({ severity: 'error', detail: response.message });
				}
			},
			// error: (err) => {
			// 	this.notificationService.toast({ severity: 'error', detail: err.message });
			// }
		});
	}
	onCancel() {
		this.ref.close();
	}

	toggleStatus(): void {
		this.status.setValue(this.status.value === Status.Active ? Status.Inactive : Status.Active);
	}
}
