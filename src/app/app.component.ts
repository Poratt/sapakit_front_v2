import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from './store/auth.store';
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, ToastModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css',
})
export class AppComponent {

	private authStore = inject(AuthStore);
	private router = inject(Router);

	constructor() {
		effect(() => {
			if (!this.authStore.isAuthenticated()) {
				console.log('User is not authenticated, redirecting to login.');
				this.router.navigate(['/login']);
			}
		});
	}
}
