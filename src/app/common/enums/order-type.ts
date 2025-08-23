import { EnumData } from '../models/enumData';

export enum OrderType {
	ByDay = 1,
	ByDate,
}

export const orderTypeData: EnumData[] = [
	{
		enumValue: OrderType.ByDay,
		label: 'לפי ימים',
		icon: 'pi pi-calendar',
		tailwind:
			'bg-gradient-to-r from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 border border-purple-200/50',
	},
	{
		enumValue: OrderType.ByDate,
		label: 'לפי תאריכים',
		icon: 'pi pi-calendar-plus',
		tailwind:
			'bg-gradient-to-r from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 border border-indigo-200/50',
	},
];
