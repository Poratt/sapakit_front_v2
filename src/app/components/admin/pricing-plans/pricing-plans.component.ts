import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlanFeature {
	name: string;
	included: boolean;
	note?: string;
}

interface PricingPlan {
	id: string;
	name: string;
	price: string;
	period: string;
	audience: string;
	icon: string;
	popular?: boolean;
	features: PlanFeature[];
}

@Component({
	selector: 'app-pricing-plans',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './pricing-plans.component.html',
    styleUrls: ['./pricing-plans.component.css']
})
export class PricingPlansComponent {
	selectedPlan = signal<string>('basic');
	hoveredPlan = signal<string | null>(null);

	readonly plans: PricingPlan[] = [
		{
			id: 'free',
			name: 'חינמית',
			price: '₪0',
			period: 'לתמיד',
			audience: 'עסק בתחילת דרכו, בעלים יחיד',
			icon: 'pi pi-gift',
			features: [
				{ name: 'משתמש 1 (הבעלים בלבד)', included: true },
				{ name: 'עד 3 ספקים', included: true },
				{ name: 'מוצרים וקטגוריות ללא הגבלה', included: true },
				{ name: 'ניהול הזמנות', included: true },
				{ name: 'לוח שנה מתקדם', included: true },
				{ name: 'דאשבורד בסיסי', included: true, note: 'הזמנות להיום וטיוטות' },
				{ name: 'היסטוריית הזמנות (7 ימים)', included: true, note: 'מוגבל ל-7 ימים אחרונים' },
				{ name: 'ייצוא לאקסל', included: false },
				{ name: 'תובנות AI', included: false },
				{ name: 'יבוא הזמנות מטקסט', included: false },
				{ name: 'תמיכה בקהילה', included: true }
			]
		},
		{
			id: 'basic',
			name: 'בסיסית',
			price: '₪49',
			period: 'לחודש',
			audience: 'עסק מבוסס עם צוות קטן',
			icon: 'pi pi-star',
            popular: true,
			features: [
				{ name: 'עד 5 משתמשים', included: true },
				{ name: 'עד 20 ספקים', included: true },
				{ name: 'כל תכונות התוכנית החינמית', included: true },
				{ name: 'היסטוריית הזמנות מלאה', included: true },
				{ name: 'ייצוא לאקסל', included: true },
				{ name: 'דאשבורד מתקדם', included: true, note: 'כולל עלויות חודשיות' },
				{ name: 'ניהול הרשאות (Admin/User)', included: true },
				{ name: 'תובנות AI', included: false },
				{ name: 'יבוא הזמנות מטקסט', included: false },
				{ name: 'תמיכה במייל', included: true }
			]
		},
		{
			id: 'pro',
			name: 'פרו',
			price: '₪99',
			period: ' לחודש',
			audience: 'עסק שרוצה אופטימיזציה מלאה',
			icon: 'pi pi-crown',
			features: [
				{ name: 'משתמשים ללא הגבלה', included: true },
				{ name: 'ספקים ללא הגבלה', included: true },
				{ name: 'כל תכונות התוכנית הבסיסית', included: true },
				{ name: 'תובנות AI מ-Gemini', included: true },
				{ name: 'יבוא הזמנות מטקסט', included: true },
				{ name: 'פיצ\'רים חדשים בעדיפות', included: true },
				{ name: 'תמיכה בעדיפות גבוהה', included: true, note: 'מייל וטלפון' }
			]
		}
	];

	selectPlan(planId: string): void {
		this.selectedPlan.set(planId);
	}
}