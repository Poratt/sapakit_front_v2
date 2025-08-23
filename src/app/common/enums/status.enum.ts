import { EnumData } from '../models/enumData';

export enum Status {
	Active = 1,
	Inactive,
}

export const statusData: EnumData[] = [
	{
		enumValue: Status.Active,
		label: 'פעיל',
		icon: 'pi pi-check-circle',
		tailwind:
			'bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 border border-green-200/50',
	},
	{
		enumValue: Status.Inactive,
		label: 'לא פעיל',
		icon: 'pi pi-times-circle',
		tailwind:
			'bg-gradient-to-r from-rose-50 to-red-100 hover:from-rose-100 hover:to-red-200 border border-rose-200/50',
	},
];
