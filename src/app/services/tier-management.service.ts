import { Injectable, computed, inject, Signal } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { SupplierStore } from '../store/supplier.store';
import { UserStore } from '../store/user.store';
import { TierStore } from '../store/tier.store'; // 1. ייבוא

type Feature = 'users' | 'suppliers';
const FEATURE_NAMES_HEBREW = {
    users: { singular: 'משתמש', plural: 'המשתמשים' },
    suppliers: { singular: 'ספק', plural: 'הספקים' },
};

@Injectable({
    providedIn: 'root'
})
export class TierManagementService {
    private authStore = inject(AuthStore);
    private supplierStore = inject(SupplierStore);
    private userStore = inject(UserStore);
    private tierStore = inject(TierStore); // 2. הזרקה

    private readonly accountTierId = computed(() => this.authStore.user()?.account?.tierId);
    
    // 3. Signal שמחזיק את פרטי התוכנית הנוכחית
    private readonly currentTierDetails = computed(() => {
        const tiers = this.tierStore.tiers();
        const currentTierId = this.accountTierId();
        if (!tiers.length || currentTierId === undefined) {
            return null;
        }
        return tiers.find(t => t.id === currentTierId);
    });

    getLimitFor(feature: Feature): number {
        const tierDetails = this.currentTierDetails();
        if (!tierDetails) return Infinity;

        switch (feature) {
            case 'users': return tierDetails.limit_users;
            case 'suppliers': return tierDetails.limit_suppliers;
            default: return Infinity;
        }
    }

    hasReachedLimit(feature: Feature): Signal<boolean> {
        return computed(() => {
            const limit = this.getLimitFor(feature);
            if (limit === -1) return false; // -1 = ללא הגבלה

            const currentCount = this.getCountFor(feature);
            return currentCount >= limit;
        });
    }

    getTooltipMessage(feature: Feature): Signal<string> {
        return computed(() => {
            const limitReached = this.hasReachedLimit(feature)();
            const limit = this.getLimitFor(feature);
            const featureName = FEATURE_NAMES_HEBREW[feature].plural;
            const featureNameSingular = FEATURE_NAMES_HEBREW[feature].singular;

            if (limitReached && limit !== -1) {
                return `הגעת למגבלת ${featureName} (${limit}) בתוכנית שלך. שדרג כדי להוסיף עוד.`;
            }
            return `הוסף ${featureNameSingular} חדש`;
        });
    }

    private getCountFor(feature: Feature): number {
        switch (feature) {
            case 'users': return this.userStore.usersCount();
            case 'suppliers': return this.supplierStore.suppliersCount();
            default: return 0;
        }
    }
}