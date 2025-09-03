import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TierStore } from '../../../store/tier.store';
import { AuthStore } from '../../../store/auth.store';
import { AccountTier } from '../../../common/models/account-tier.model';
import { LoaderComponent } from '../../shared/loader/loader.component';

interface PlanFeature {
	name: string;
	included: boolean;
	note?: string;
}

interface DisplayPlan extends AccountTier {
    features: PlanFeature[];
}

@Component({
	selector: 'app-pricing-plans',
	standalone: true,
	imports: [CommonModule, LoaderComponent],
	templateUrl: './pricing-plans.component.html',
    styleUrls: ['./pricing-plans.component.css']
})
export class PricingPlansComponent implements OnInit {
    private tierStore = inject(TierStore);
    private authStore = inject(AuthStore);

	selectedPlan = signal<number | undefined>(undefined);
	hoveredPlan = signal<number | null>(null);
    isLoading = computed(() => this.tierStore.isLoading() || this.plans().length === 0);
    
    plans = computed<DisplayPlan[]>(() => {
        return this.tierStore.tiers().map(tier => ({
            ...tier,
            features: this.buildFeaturesForTier(tier)
        }));
    });

    ngOnInit() {
        this.tierStore.loadTiers();
        this.selectedPlan.set(this.authStore.user()?.account?.tierId);
    }

	selectPlan(planId: number): void {
		this.selectedPlan.set(planId);
	}

    private buildFeaturesForTier(tier: AccountTier): PlanFeature[] {
        const features: PlanFeature[] = [];

        features.push({ 
            name: tier.limit_users === -1 ? 'משתמשים ללא הגבלה' : `עד ${tier.limit_users} משתמשים`,
            included: true 
        });

        features.push({
            name: tier.limit_suppliers === -1 ? 'ספקים ללא הגבלה' : `עד ${tier.limit_suppliers} ספקים`,
            included: true
        });

        features.push({
            name: tier.limit_history_days === -1 ? 'היסטוריית הזמנות מלאה' : 'היסטוריית הזמנות',
            included: true,
            note: tier.limit_history_days !== -1 ? `מוגבל ל-${tier.limit_history_days} ימים אחרונים` : undefined
        });

        features.push({ name: 'ייצוא לאקסל', included: tier.can_export_excel });
        features.push({ name: 'ניהול הרשאות (Admin/User)', included: tier.can_manage_roles });
        features.push({ name: 'תובנות AI', included: tier.can_use_ai_insights });
        features.push({ name: 'יבוא הזמנות מטקסט', included: tier.can_import_from_text });
        
        const supportMap: {[key: string]: string} = {
            community: 'תמיכה בקהילה',
            email: 'תמיכה במייל',
            priority: 'תמיכה בעדיפות גבוהה'
        };
        features.push({ name: supportMap[tier.support_level] || 'תמיכה', included: true });

        return features;
    }
}