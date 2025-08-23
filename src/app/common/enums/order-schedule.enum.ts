import { EnumData } from '../models/enumData';

export enum OrderSchedule {
	Today = 1,
	Future,
	Historical, // הוספת ערך להזמנות היסטוריות
}

// הוספת נתוני enum עבור סטטוס הזמנה
export const OrderStatusData: EnumData[] = [
	{
		enumValue: 1,
		label: 'הזמנה חדשה',
		icon: 'pi pi-star',
		tailwind: 'bg-green-100 hover:bg-green-200',
	},
	{
		enumValue: 2,
		label: 'בתהליך',
		icon: 'pi pi-clock',
		tailwind: 'bg-yellow-100 hover:bg-yellow-200',
	},
	{
		enumValue: 3,
		label: 'הושלמה',
		icon: 'pi pi-check',
		tailwind: 'bg-blue-100 hover:bg-blue-200',
	},
	{
		enumValue: 4,
		label: 'בוטלה',
		icon: 'pi pi-times',
		tailwind: 'bg-red-100 hover:bg-red-200',
	},
];

// נתוני enum קיימים לסטטוס לוח שנה
export const OrderScheduleData: EnumData[] = [
	{
		enumValue: 1,
		label: 'הזמנה להיום',
		icon: 'pi pi-bell',
		tailwind: 'bg-blue-100 hover:bg-blue-200',
	},
	{
		enumValue: 2,
		label: 'הזמנה עתידית',
		icon: 'pi pi-clock',
		tailwind: 'bg-orange-100 hover:bg-orange-200',
	},
	{
		enumValue: 3,
		label: 'הזמנה היסטורית',
		icon: 'pi pi-history',
		tailwind: 'bg-gray-100 hover:bg-gray-200',
	},
];
