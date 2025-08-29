import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
	name: 'markdownToHtml',
	standalone: true
})
export class MarkdownToHtmlPipe implements PipeTransform {

	constructor(private sanitizer: DomSanitizer) { }

	transform(value: string | undefined | null): SafeHtml {
		if (!value) {
			return '';
		}

		// החלף **טקסט** ב-<strong class="highlight">טקסט</strong>
		const html = value.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>');

		// השתמש ב-DomSanitizer כדי לסמן את ה-HTML כבטוח
		return this.sanitizer.bypassSecurityTrustHtml(html);
	}
}