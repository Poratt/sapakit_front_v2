import { EnumData } from '../models/enumData';

export enum ReminderType {
	EachTime = 1,
	UntilOrderDone,
}

export const reminderTypeData: EnumData[] = [
	{
		enumValue: ReminderType.EachTime,
		label: 'תזכורת לכל מועד', 
		tooltip: 'קבל תזכורת בכל יום הזמנה קבוע',
		icon: 'pi pi-bell',
		tailwind:
			'bg-gradient-to-r from-violet-50 to-purple-100 hover:from-violet-100 hover:to-purple-200 border border-violet-200/50',
	},
	{
		enumValue: ReminderType.UntilOrderDone,
		label: 'תזכורת שבועית חכמה', 
		tooltip: 'קבל תזכורת רק אם טרם הזמנת מהספק באותו שבוע',
		icon: 'pi pi-clock',
		tailwind:
			'bg-gradient-to-r from-cyan-50 to-emerald-100 hover:from-cyan-100 hover:to-emerald-200 border border-cyan-200/50',
	},
];