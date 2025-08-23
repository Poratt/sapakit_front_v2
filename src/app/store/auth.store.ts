// src/app/store/auth.store.ts
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, firstValueFrom, of, pipe, switchMap, tap } from 'rxjs';
import { UserRole } from '../common/enums/userRole.enum';
import { NotificationService } from '../services/notification.service'; // ✅ ייבוא חסר
import { User } from '../common/models/user';

// ✅ הגדרת ה-interface החסר
interface LoginCredentials {
	email: string;
	password: string;
}

interface AuthState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	isLoading: false,
	error: null,
};

export const AuthStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withComputed(({ user }) => ({
		isAuthenticated: computed(() => !!user()),
		isGuest: computed(() => !user()),
		userRole: computed(() => user()?.role ?? UserRole.User),
	})),
	withMethods(
		(
			store,
			// ✅ הזרקת כל השירותים הנדרשים
			authService = inject(AuthService),
			notificationService = inject(NotificationService),
		) => {
			// --- מתודות אסינכרוניות ---

			const loadUser = rxMethod<void>(
				pipe(
					tap(() => patchState(store, { isLoading: true, error: null })),
					switchMap(() =>
						authService.getCurrentUser().pipe(
							tap({
								next: (user: User | null) => {
									patchState(store, { user, isLoading: false });
								},
								error: (err) => {
									patchState(store, { user: null, isLoading: false, error: err.message });
								},
							}),
						),
					),
				),
			);

			// --- מחזירים את כל המתודות ---
			return {
				async initialize(): Promise<void> {
					patchState(store, { isLoading: true });
					try {
						const user = await firstValueFrom(authService.getCurrentUser());
						patchState(store, { user: user || null, isLoading: false });
						if (user) {
							console.log('APP_INITIALIZER: User session restored.');
						} else {
							console.log('APP_INITIALIZER: No active session.');
						}
					} catch (error) {
						patchState(store, { user: null, isLoading: false });
						console.log('APP_INITIALIZER: Error restoring session.');
					}
				},

				loadUser: loadUser, // חשיפת המתודה החוצה

				logout: rxMethod<void>(
					pipe(
						tap(() => patchState(store, { isLoading: true })),
						switchMap(() =>
							authService.logout().pipe(
								tap({
									next: () => {
										patchState(store, initialState);
									},
									error: (err) => {
										patchState(store, { isLoading: false, error: err.message });
									},
								}),
							),
						),
					),
				),

				login: rxMethod<LoginCredentials>(
					pipe(
						tap(() => patchState(store, { isLoading: true, error: null })),
						switchMap((credentials) =>
							authService.login(credentials).pipe(
								tap({
									next: (response) => {
										if (response.success && response.result) {
											// ✅ קוראים למתודה המקומית
											loadUser();
										} else {
											throw new Error(response.message || 'Login failed');
										}
									},
								}),
								catchError((err) => {
									const errorMessage = err.error?.message || err.message || 'Invalid credentials';
									patchState(store, { isLoading: false, error: errorMessage });
									// ✅ עכשיו notificationService זמין
									notificationService.toast({ severity: 'error', detail: errorMessage });
									return of();
								}),
							),
						),
					),
				),
			};
		},
	),
);