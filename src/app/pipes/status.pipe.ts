import { Pipe, PipeTransform } from '@angular/core';
import { Status, statusData } from '../common/enums/status.enum';

@Pipe({
	name: 'statusLabel',
	standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
	transform(status: Status): string {
		const foundData = statusData.find((data) => data.enumValue === status);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'statusIcon',
	standalone: true,
})
export class StatusIconPipe implements PipeTransform {
	transform(status: Status): string {
		const foundData = statusData.find((data) => data.enumValue === status);
		return foundData && foundData.icon ? foundData.icon : '';
	}
}

@Pipe({
	name: 'statusColor',
	standalone: true,
})
export class StatusColorPipe implements PipeTransform {
	transform(status: Status): string {
		const foundData = statusData.find((data) => data.enumValue === status);
		return foundData && foundData.background ? foundData.background : '';
	}
}
