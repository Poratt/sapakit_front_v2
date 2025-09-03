import { Injectable, computed, inject, Signal } from '@angular/core'; // 1. הוספת Signal
import { AuthStore } from '../store/auth.store';
import { SupplierStore } from '../store/supplier.store';
import { UserStore } from '../store/user.store';
import { AccountTier } from '../common/enums/account-tier.enums';

const TIER_LIMITS = {
    [AccountTier.Free]: { users: 1, suppliers: 3 },
    [AccountTier.Basic]: { users: 5, suppliers: 20 },
    [AccountTier.Pro]: { users: Infinity, suppliers: Infinity },
};

// 2. יצירת מילון שמות בעברית במקום מרכזי
const FEATURE_NAMES_HEBREW = {
    users: { singular: 'משתמש', plural: 'המשתמשים' },
    suppliers: { singular: 'ספק', plural: 'הספקים' },
};

type Feature = keyof typeof FEATURE_NAMES_HEBREW;

@Injectable({
    providedIn: 'root'
})
export class TierManagementService {
    private authStore = inject(AuthStore);
    private supplierStore = inject(SupplierStore);
    private userStore = inject(UserStore);

    private readonly accountTier = computed(() => this.authStore.user()?.account?.tier);
    
    getLimitFor(feature: Feature): number {
        const tier = this.accountTier();
        if (tier === undefined || tier === null) {
            return Infinity;
        }
        return TIER_LIMITS[tier][feature];
    }

    hasReachedLimit(feature: Feature): Signal<boolean> { // החזרת Signal<boolean> במקום פונקציה
        return computed(() => {
            const limit = this.getLimitFor(feature);
            const currentCount = this.getCountFor(feature);
            return currentCount >= limit;
        });
    }
    
    // --- 3. המתודה החדשה ---
    /**
     * יוצר הודעת tooltip דינמית עבור פיצ'ר מסוים.
     * @param feature - 'users' or 'suppliers'
     * @returns Signal<string> ריאקטיבי עם ההודעה המתאימה.
     */
    getTooltipMessage(feature: Feature): Signal<string> {
        return computed(() => {
            const limitReached = this.hasReachedLimit(feature)();
            const limit = this.getLimitFor(feature);
            const featureName = FEATURE_NAMES_HEBREW[feature].plural;
            const featureNameSingular = FEATURE_NAMES_HEBREW[feature].singular;

            if (limitReached) {
                return `הגעת למגבלת ${featureName} (${limit}) בתוכנית שלך. שדרג כדי להוסיף עוד.`;
            }
            return `הוסף ${featureNameSingular} חדש`;
        });
    }

    private getCountFor(feature: Feature): number {
        switch (feature) {
            case 'users':
                return this.userStore.usersCount();
            case 'suppliers':
                return this.supplierStore.suppliersCount();
            default:
                return 0;
        }
    }
}