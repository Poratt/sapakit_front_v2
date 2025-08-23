import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { computed, inject } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Insight } from '../common/models/insight';

interface InsightState {
    insights: Insight[];
    isLoading: boolean;
}

const initialState: InsightState = { insights: [], isLoading: false };

export const InsightStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ insights }) => ({
        unreadCount: computed(() => insights().length),
        hasUnread: computed(() => insights().length > 0),
    })),
    withMethods((store, api = inject(ApiService)) => ({
        loadInsights: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(() => api.getUnreadInsights().pipe(
                    tap(res => patchState(store, { insights: res.result || [], isLoading: false }))
                ))
            )
        ),
        markAsRead: rxMethod<number>(
            pipe(
                switchMap(id => api.markInsightAsRead(id).pipe(
                    tap(() => {
                        // הסר את התובנה מהמצב המקומי
                        patchState(store, (state) => ({
                            insights: state.insights.filter(i => i.id !== id)
                        }));
                    })
                ))
            )
        )
    }))
);