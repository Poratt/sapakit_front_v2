import { Pipe, PipeTransform } from '@angular/core';
import { ReminderType, reminderTypeData } from '../common/enums/reminderType';

@Pipe({
	name: 'reminderTypeLabel',
	standalone: true,
})
export class ReminderTypePipe implements PipeTransform {
	transform(ReminderType: ReminderType): string {
		const foundData = reminderTypeData.find((data) => data.enumValue === ReminderType);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'reminderTypeIcon',
	standalone: true,
})
export class ReminderTypeIconPipe implements PipeTransform {
	transform(reminderType: ReminderType): string {
		const foundData = reminderTypeData.find((data) => data.enumValue === reminderType);
		return foundData && foundData.icon ? foundData.icon : '';
	}
}

@Pipe({
	name: 'reminderTypeColor',
	standalone: true,
})
export class ReminderTypeColorPipe implements PipeTransform {
	transform(reminderType: ReminderType): string {
		const foundData = reminderTypeData.find((data) => data.enumValue === reminderType);
		return foundData && foundData.background ? foundData.background : '';
	}
}
