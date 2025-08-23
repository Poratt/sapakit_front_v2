import { EnumData } from '../models/enumData';

export enum UserRole {
	Admin = 1,
	Manager,
	User,
}

export const userRoleData: EnumData[] = [
	{
		enumValue: UserRole.Admin,
		label: 'מנהל',
		icon: 'pi pi-shield',
		tailwind:
			'bg-gradient-to-r from-red-50 to-rose-100 hover:from-red-100 hover:to-rose-200 border border-red-200/50',
	},
	{
		enumValue: UserRole.Manager,
		label: 'מנהל מערכת',
		icon: 'pi pi-users',
		tailwind:
			'bg-gradient-to-r from-slate-50 to-gray-100 hover:from-slate-100 hover:to-gray-200 border border-slate-200/50',
	},
	{
		enumValue: UserRole.User,
		label: 'משתמש',
		icon: 'pi pi-user',
		tailwind:
			'bg-gradient-to-r from-blue-50 to-sky-100 hover:from-blue-100 hover:to-sky-200 border border-blue-200/50',
	},
];
