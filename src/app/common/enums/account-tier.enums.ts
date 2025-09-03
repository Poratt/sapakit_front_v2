// in src/enums/account-tier.enum.ts

import { EnumData } from '../models/enumData'; // ודא שהנתיב לקובץ המודל נכון

export enum AccountTier {
	Free = 1,
	Basic,
	Pro,
}

export const AccountTierData: EnumData[] = [
	{
		enumValue: AccountTier.Free,
		label: 'חינמית',
		icon: 'pi pi-gift',
		tailwind: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
	},
	{
		enumValue: AccountTier.Basic,
		label: 'בסיסית',
		icon: 'pi pi-star',
		tailwind: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
	},
	{
		enumValue: AccountTier.Pro,
		label: 'פרו',
		icon: 'pi pi-crown',
		tailwind: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
	},
];