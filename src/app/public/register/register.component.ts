import { Component, inject, signal } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
	AbstractControl,
	ValidationErrors,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { markFormGroupTouched } from '../../common/const/custom-validators';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from '../../services/api.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateUserDto } from '../../common/dto/user-create.dto';


@Component({
	selector: 'app-register',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		InputTextModule,
		PasswordModule,
		ButtonModule,
		RouterModule,
		CardModule,
		IconFieldModule,
		InputIconModule,
	],
	templateUrl: './register.component.html',
	styleUrl: './register.component.css',
	providers: [DialogService],
})
export class RegisterComponent {
	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private apiService = inject(ApiService);
	private notificationService = inject(NotificationService);
	private router = inject(Router);

	formSubmitted = signal<boolean>(false);
	loading = signal<boolean>(false);
	readonly currentYear = new Date().getFullYear();
	registerForm: FormGroup = this.fb.group(
		{
			username: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
		},
		{
			validators: this.passwordMatchValidator,
		},
	);

	get username(): AbstractControl {
		return this.registerForm.get('username') as AbstractControl<string>;
	}
	get email(): AbstractControl {
		return this.registerForm.get('email') as AbstractControl<string>;
	}
	get password(): AbstractControl {
		return this.registerForm.get('password') as AbstractControl<string>;
	}
	get confirmPassword(): AbstractControl {
		return this.registerForm.get('confirmPassword') as AbstractControl<string>;
	}

	private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.get('password')?.value;
		const confirmPassword = control.get('confirmPassword')?.value;
		return password === confirmPassword ? null : { mismatch: true };
	}

	onSubmit() {
		this.formSubmitted.set(true);
		markFormGroupTouched(this.registerForm);

		if (this.registerForm.invalid) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'Please fill all required fields correctly',
			});
			return;
		}

		this.loading.set(true);
		const formValue = this.registerForm.value;
		const registrationPayload: CreateUserDto = {
			email: formValue.email,
			username: formValue.username,
			password: formValue.password
		};



		this.apiService.register(registrationPayload).subscribe({
			next: () => {
				this.notificationService.toast({
					severity: 'success',
					detail: 'Registration successful! Please login.',
				});
				this.router.navigate(['/login']);
			},
			error: (err: HttpErrorResponse) => {
				this.loading.set(false);
				this.notificationService.toast({
					severity: 'error',
					detail: err.error?.message || 'Registration failed. Please try again.',
				});
			},
		});
	}
}
