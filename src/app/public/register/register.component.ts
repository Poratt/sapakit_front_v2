import { Component, inject, signal, ViewChild } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
	AbstractControl,
	ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { detailedPasswordValidator, markFormGroupTouched } from '../../common/const/custom-validators';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateUserDto } from '../../common/dto/user-create.dto';
import { AuthStore } from '../../store/auth.store';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordInputComponent } from '../../components/shared/password-input/password-input.component';


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
		PasswordInputComponent,
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

	private authStore = inject(AuthStore);
	public readonly passwordLength = signal(8);

	@ViewChild('passwordInputComp') passwordInputComp!: PasswordInputComponent;


	formSubmitted = signal<boolean>(false);
	loading = signal<boolean>(false);
	readonly currentYear = new Date().getFullYear();
	registerForm: FormGroup = this.fb.group(
		{
			username: ['', Validators.required],
			accountName: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, detailedPasswordValidator()]],
			confirmPassword: ['', Validators.required],
		},
		{
			validators: this.passwordMatchValidator,
		},
	);

	get username(): AbstractControl { return this.registerForm.get('username') as AbstractControl<string> }
	get accountName(): AbstractControl { return this.registerForm.get('accountName') as AbstractControl<string> }
	get email(): AbstractControl { return this.registerForm.get('email') as AbstractControl<string> }
	get password(): AbstractControl { return this.registerForm.get('password') as AbstractControl<string> }
	get confirmPassword(): AbstractControl { return this.registerForm.get('confirmPassword') as AbstractControl<string> }

	private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.get('password')?.value;
		const confirmPassword = control.get('confirmPassword')?.value;
		return password === confirmPassword ? null : { mismatch: true };
	}


	onSubmit() {
		this.formSubmitted.set(true);
		markFormGroupTouched(this.registerForm);

		if (this.password && this.passwordInputComp) {
			this.passwordInputComp.markAsTouched();
		}

		if (this.registerForm.invalid) {
			this.notificationService.toast({
				severity: 'error',
				detail: 'יש למלא את כל השדות המסומנים באדום',
			});
			return;
		}

		this.loading.set(true);
		const formValue = this.registerForm.value;
		const registrationPayload: CreateUserDto = {
			email: formValue.email,
			username: formValue.username,
			password: formValue.password,
			accountName: formValue.accountName,
		};



		this.apiService.register(registrationPayload).subscribe({
			next: () => {
				this.notificationService.toast({
					severity: 'success',
					detail: 'ההרשמה בוצעה בהצלחה!',
				});
				this.authStore.login({
					email: formValue.email,
					password: formValue.password
				});
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
