import { Pipe, PipeTransform } from '@angular/core';
import { Package, PackageData } from '../common/enums/package';

@Pipe({
	name: 'pluralizePackage',
	standalone: true,
})
export class PluralizePackagePipe implements PipeTransform {
	transform(quantity: number, packageEnumValue: Package): string {
		if (quantity === null || quantity === undefined) {
			return '';
		}

		const packageInfo = PackageData.find(p => p.enumValue === packageEnumValue);
		if (!packageInfo) {
			return `${quantity}`; // Fallback
		}

		// חוקי הריבוי בעברית
		if (quantity === 1) {
			return `${quantity} ${packageInfo.label}`; // 1 יחידה
		}

		// עבור 2 ומעלה, נשתמש בצורת הרבים
		return `${quantity} ${packageInfo.labelPlural || packageInfo.label}`;
	}
}