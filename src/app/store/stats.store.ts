import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, filter, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { DashboardStats } from '../common/models/statistics';

interface StatsState {
	stats: DashboardStats;
	isLoading: boolean;
	error: string | null;
}

const initialState: StatsState = {
	stats: {
		openOrders: 0,
		dueToday: 0,
		monthlyCost: 0,
		prevMonthlyCost: 0,
		costChangePercentage: 0,
		activeSuppliers: 0,
	},
	isLoading: false,
	error:  null,
};

export const StatsStore = signalStore(
	{ providedIn: 'root' },

	withState(initialState),

	withMethods((store, apiService = inject(ApiService), notificationService = inject(NotificationService)) => ({
		loadStats: rxMethod<{ force?: boolean }>(
			pipe(
                filter(({ force }) => force || store.stats().openOrders === 0),
				tap(() => patchState(store, { isLoading: true, error: null })			),
				switchMap(() =>
					apiService.getDashboardKpis().pipe(
						tap((response) => {
							// console.log('Loading stats...')	
                            if (response.success && response.result) {
                                patchState(store, { stats: response.result, isLoading: false });
                            } else {
                                throw new Error(response.message || 'Failed to load stats');
                            }
						}),
                        catchError((err: HttpErrorResponse | Error) => {
                            const errorMsg = err.message || 'A server error occurred';
                            patchState(store, { error: errorMsg, isLoading: false });
                            // notificationService.toast({ severity: 'error', detail: errorMsg });
                            return of();
                        })
					)
				)
			)
		),
	}))
);