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
			name: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
		},
		{
			validators: this.passwordMatchValidator,
		},
	);

	get name(): AbstractControl {
		return this.registerForm.get('name') as AbstractControl<string>;
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
		const user = this.registerForm.value as FormData;

		this.apiService.register(user).subscribe({
			next: () => {
				this.notificationService.toast({
					severity: 'success',
					detail: 'Registration successful! Please login.',
				});
				this.router.navigate(['/login']);
			},
			error: (err) => {
				this.loading.set(false);
				this.notificationService.toast({
					severity: 'error',
					detail: err.message || 'Registration failed. Please try again.',
				});
			},
		});
	}
}
