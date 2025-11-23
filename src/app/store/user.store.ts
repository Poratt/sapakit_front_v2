// src/app/store/user.store.ts
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { catchError, filter, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service'; import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ServiceResultContainer } from '../common/models/serviceResultContainer';
import { User } from '../common/models/user';

interface UserState {
	users: User[];
	isLoading: boolean;
	error: string | null;
}

const initialState: UserState = {
	users: [],
	isLoading: false,
	error: null,
};

export const UserStore = signalStore(
	{ providedIn: 'root' },
	withState(initialState),
	withComputed(({ users }) => ({
		usersCount: computed(() => users().length),
		activeUsers: computed(() => users().filter((u) => !u.isDeleted)),
	})),
	withMethods((
		store,
		apiService = inject(ApiService),
		notificationService = inject(NotificationService),
	) => {
		// --- שלב 1: הגדר את כל המתודות הסינכרוניות כאן ---
		const syncMethods = {
			addUser(user: User): void {
				patchState(store, (state) => ({
					users: [...state.users, user],
				}));
			},
			addUsers(users: User[]): void {
                if (!users || users.length === 0) return;
                patchState(store, (state) => ({
                    users: [...state.users, ...users],
                }));
            },
			updateUser(updatedUser: Partial<User>): void {
				patchState(store, (state) => ({
					users: state.users.map(u => {
						if (u.id === updatedUser.id) {
							return { ...u, ...updatedUser };
						}
						return u;
					}),
				}));

			},
			removeUser(userId: number): void {
				patchState(store, (state) => ({
					users: state.users.filter((u) => u.id !== userId),
				}));
			},
			reset(): void {
				patchState(store, initialState);
			},
		};

		// --- שלב 2: הגדר את המתודות האסינכרוניות והשתמש במתודות הסינכרוניות ---
		const asyncMethods = {
			loadUsers: rxMethod<{ force?: boolean }>(
				pipe(
					filter(({ force }) => force || store.users().length === 0),
					tap(() => patchState(store, { isLoading: true, error: null })),
					switchMap(() =>
						apiService.getUsers().pipe(
							tap({
								next: (response: ServiceResultContainer<User[]>) => {
									if (response.success && response.result) {
										patchState(store, { users: response.result, isLoading: false });
									} else {
										throw new Error(response.message || 'Failed to load users');
									}
								},
							}),
							catchError((err: HttpErrorResponse | Error) => {
								const errorMsg = err.message || 'A server error occurred';
								patchState(store, { error: errorMsg, isLoading: false });
								return of();
							}),
						),
					),
				),
			),
			// in user.store.ts -> withMethods

			deleteUser: rxMethod<number>(
    pipe(
        // אל תעדכן את ה-error state הגלובלי בכלל
        switchMap((userId) => 
            apiService.deleteUser(userId).pipe(
                tap({
                    next: () => {
                        patchState(store, (state) => ({
                            users: state.users.filter(u => u.id !== userId),
                        }));
                        notificationService.toast({ severity: 'success', detail: 'המשתמש נמחק בהצלחה' });
                    },
                    error: (err: HttpErrorResponse) => {
                        // טפל בשגיאה באופן מקומי - רק הצג הודעה
                        const errorMessage = err.error?.message || 'שגיאה במחיקת המשתמש';
                        notificationService.toast({ severity: 'error', detail: errorMessage });
                    }
                }),
                // ה-catchError רק מונע קריסה
                catchError(() => of(null)) 
            )
        )
    )
),
		};


		// --- שלב 3: החזר את כל המתודות מאוחדות ---
		return {
			...syncMethods,
			...asyncMethods,
		};
	}),
);