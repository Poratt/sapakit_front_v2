import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AccountTier } from '../common/models/account-tier.model';

interface TierState {
    tiers: AccountTier[];
    isLoading: boolean;
    error: string | null; // נוסיף שדה לשגיאות
}

const initialState: TierState = {
    tiers: [],
    isLoading: false,
    error: null,
};

export const TierStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, api = inject(ApiService)) => ({
        loadTiers: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })), // מאתחל טעינה
                switchMap(() => api.getTiersConfig().pipe(
                    tap(res => {
                        if (res.success && res.result) {
                            patchState(store, { tiers: res.result, isLoading: false });
                        } else {
                            // אם השרת החזיר שגיאה לוגית
                            patchState(store, { tiers: [], isLoading: false, error: res.message });
                        }
                    }),
                    catchError((err) => {
                        // אם הייתה שגיאת רשת
                        patchState(store, { tiers: [], isLoading: false, error: err.message });
                        return of(null); // מנע קריסה של ה-stream
                    })
                ))
            )
        ),
    }))
);