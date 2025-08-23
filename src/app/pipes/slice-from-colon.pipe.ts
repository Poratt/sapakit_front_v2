import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sliceFromColon',
	standalone: true,
})
export class SliceFromColonPipe implements PipeTransform {
	transform(value: string): string {
		if (!value || typeof value !== 'string') {
			return value;
		}

		const index = value.indexOf(':');
		if (index === -1) {
			return value;
		}

		return value.substring(index + 1).trim();
	}
}
