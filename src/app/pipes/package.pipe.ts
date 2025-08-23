import { Pipe, PipeTransform } from '@angular/core';
import { PackageData, Package } from '../common/enums/package';

@Pipe({
	name: 'packageLabel',
	standalone: true,
})
export class ReminderTypePipe implements PipeTransform {
	transform(pack: Package): string {
		const foundData = PackageData.find((data) => data.enumValue === pack);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'packageIcon',
	standalone: true,
})
export class ReminderTypeIconPipe implements PipeTransform {
	transform(pack: Package): string {
		const foundData = PackageData.find((data) => data.enumValue === pack);
		return foundData && foundData.icon ? foundData.icon : '';
	}
}

@Pipe({
	name: 'packageColor',
	standalone: true,
})
export class ReminderTypeColorPipe implements PipeTransform {
	transform(pack: Package): string {
		const foundData = PackageData.find((data) => data.enumValue === pack);
		return foundData && foundData.tailwind ? foundData.tailwind : '';
	}
}
