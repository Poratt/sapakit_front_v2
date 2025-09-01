import { Component, effect, inject, signal } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { markFormGroupTouched } from '../../common/const/custom-validators';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { UserRole } from '../../common/enums/userRole.enum';


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
		IconFieldModule,
		InputIconModule,
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent {
	private fb = inject(FormBuilder);
	private authStore = inject(AuthStore);
	private notificationService = inject(NotificationService);
	private router = inject(Router);
	private readonly route = inject(ActivatedRoute);

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
        effect(() => {
            if (this.authStore.isAuthenticated()) {
                // קבל את ה-URL לחזרה מה-Query Params
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultUrlForUser();
                this.router.navigateByUrl(returnUrl);
            }
        });
    }

    private getDefaultUrlForUser(): string {
        const user = this.authStore.user();
        if (user?.role === UserRole.SysAdmin) {
            return '/admin';
        }
        return '/';
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

}