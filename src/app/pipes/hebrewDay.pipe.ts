import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'hebrewDay',
	standalone: true,
})
export class HebrewDayPipe implements PipeTransform {
	private hebrewDays: string[] = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

	transform(dayIndex: number): string {
		if (dayIndex < 0 || dayIndex > 6) {
			return 'לא ידוע';
		}
		return `${this.hebrewDays[dayIndex]}׳`;
	}
}

export function getHebrewDayName(date: Date | null): string {
	if (!date) return 'יום לא ידוע';

	const hebrewDays = [
		'א׳',    // Sunday - 0
		'ב׳',      // Monday - 1  
		'ג׳',    // Tuesday - 2
		'ד׳',    // Wednesday - 3
		'ה׳',    // Thursday - 4
		'ו׳',     // Friday - 5
		'שבת'       // Saturday - 6
	];

	return hebrewDays[date.getDay()];
}