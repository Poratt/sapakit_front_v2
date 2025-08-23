import { Component, effect, inject, signal } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { markFormGroupTouched } from '../../common/const/custom-validators';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		InputTextModule,
		PasswordModule,
		ButtonModule,
		CheckboxModule,
		RouterModule,
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent {
	private fb = inject(FormBuilder);
	private authStore = inject(AuthStore); 
	private notificationService = inject(NotificationService);
	private router = inject(Router);

	formSubmitted = signal<boolean>(false);
	loading = signal<boolean>(false);
    readonly currentYear = new Date().getFullYear();

	loginForm: FormGroup = this.fb.group({
		email: ['porat@mail.com', [Validators.required, Validators.email]],
		password: ['password', Validators.required],
		rememberMe: [false],
	});

	get email(): AbstractControl {
		return this.loginForm.get('email') as AbstractControl<string>;
	}
	get password(): AbstractControl {
		return this.loginForm.get('password') as AbstractControl<string>;
	}
	// get rememberMe(): AbstractControl {
	// 	return this.loginForm.get('rememberMe') as AbstractControl<boolean>;
	// }

	constructor() {
		// ניווט אוטומטי בהצלחה
		effect(() => {
			if (this.authStore.isAuthenticated()) {
				const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/';
				this.router.navigateByUrl(returnUrl);
				this.notificationService.toast({ severity: 'success', detail: 'התחברת בהצלחה!' });
			}
		});
	}
	
	onSubmit() {
		markFormGroupTouched(this.loginForm);

		if (this.loginForm.invalid) {
			this.notificationService.toast({ detail: 'אנא מלא את כל השדות הנדרשים' });
			return;
		}

		// ✅ קרא למתודת ה-login ב-Store
		this.authStore.login(this.loginForm.getRawValue());
	}

	// onSubmit() {
	// 	console.log('on  submit is runnings');

	// 	this.formSubmitted.set(true);
	// 	markFormGroupTouched(this.loginForm);

	// 	if (this.loginForm.invalid) {
	// 		this.notificationService.toast({
	// 			severity: 'error',
	// 			// summary: 'שגיאה',
	// 			detail: 'אנא מלא את כל השדות הנדרשים',
	// 		});
	// 		return;
	// 	}

	// 	this.loading.set(true);
	// 	const { email, password } = this.loginForm.value;

	// 	    this.authService.login({ email, password }).subscribe({
	// 		next: (response) => {
	// 			this.loading.set(false);
	// 			if (response?.success) {
	// 				this.notificationService.toast({
	// 					severity: 'success',
	// 					summary: 'התחברות',
	// 					detail: 'התחברת בהצלחה!',
	// 				});
	// 				const returnUrl =
	// 					this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/';
	// 				this.router.navigateByUrl(returnUrl);
	// 			} else {
	// 				this.notificationService.toast({
	// 					severity: 'error',
	// 					summary: 'שגיאה',
	// 					detail: response?.message || 'פרטי ההתחברות לא תקינים',
	// 				});
	// 			}
	// 		},
	// 		error: (err) => {
	// 			this.loading.set(false);
	// 			console.error('Login error:', err);
	// 			this.notificationService.toast({
	// 				severity: 'error',
	// 				summary: 'שגיאה',
	// 				detail: err.error?.message || 'אירעה שגיאה בעת ההתחברות. אנא נסה שוב.',
	// 			});
	// 		},
	// 	});
	// }
}
