import { BaseModel } from '../models/base-model';
import { EnumData } from '../models/enumData';

export enum Package {
	Unit = 1, // יחידה
	Box, // ארגז
	Bag, // שקית
	Kilogram, // קילוגרם
	Carton, // קרטון
	Pack, // חבילה
}

export const PackageData: EnumData[] = [
	{
		enumValue: Package.Unit,
		label: 'יחידה',
		icon: 'pi pi-box',
		tailwind:
			'bg-gradient-to-r from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 border border-purple-200/50',
	},
	{
		enumValue: Package.Box,
		label: 'ארגז',
		icon: 'pi pi-briefcase',
		tailwind:
			'bg-gradient-to-r from-cyan-50 to-teal-100 hover:from-cyan-100 hover:to-teal-200 border border-cyan-200/50',
	},
	{
		enumValue: Package.Bag,
		label: 'שקית',
		icon: 'pi pi-shopping-bag',
		tailwind:
			'bg-gradient-to-r from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200 border border-yellow-200/50',
	},
	{
		enumValue: Package.Kilogram,
		label: 'קילוגרם',
		icon: 'pi pi-tablet',
		tailwind:
			'bg-gradient-to-r from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 border border-emerald-200/50',
	},
	{
		enumValue: Package.Carton,
		label: 'קרטון',
		icon: 'pi pi-box',
		tailwind:
			'bg-gradient-to-r from-blue-50 to-sky-100 hover:from-blue-100 hover:to-sky-200 border border-blue-200/50',
	},
	{
		enumValue: Package.Pack,
		label: 'חבילה',
		icon: 'pi pi-package',
		tailwind:
			'bg-gradient-to-r from-orange-50 to-rose-100 hover:from-orange-100 hover:to-rose-200 border border-orange-200/50',
	},
];
