import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'textSplit',
	standalone: true
})
export class TextSplitPipe implements PipeTransform {
	transform(value: string | undefined): string[] | null {
		if (!value) return null;

		// חלוקה לפי רווחים או סימני פיסוק נפוצים (רווח, נקודה, נקודה-פסיק, קו-מקף)
		const parts = value.trim().split(/[ \.-]+/);

		// מסנן חלקים ריקים ומחזיר רק חלקים עם תוכן
		return parts.filter(part => part.length > 0);
	}
}

// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
// 	name: 'split',
// 	standalone: true,
// })
// export class SplitPipe implements PipeTransform {
// 	transform(value: string, separator: string): string[] {
// 		return value.split(separator);
// 	}
// }
