import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { EnumData } from '../../../common/models/enumData';


@Component({
	selector: 'app-badge',
	standalone: true,
	imports: [CommonModule, TooltipModule],
	template: `
		<span
			[class]="'badge' + (size() ? ' badge-' + size() : '')"
			[ngClass]="selectedData()?.tailwind || defaultTailwind()"
			tabindex="0"
			>

			<span class="{{ selectedData()?.icon || defaultIcon() }}"></span>
			{{ label() ? label() : selectedData()?.label || 'הזמנה' }}
		</span>
	`,
	styleUrls: ['./badge.component.css'],

})
export class BadgeComponent {
	enumValue = input<number | string | null>((null));
	dataArray = input<EnumData[]>([]);
	data = input<EnumData | undefined>(undefined);
	defaultTailwind = input<string>('bg-gray-60 text-gray-800 hover bg-gray-80');
	label = input<string>('');
	defaultIcon = input<string>('pi pi-tag');
	size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

	selectedData = computed(() => {
		if (this.data()) {
			return this.data();
		}

		if (this.enumValue() !== null && this.enumValue() !== undefined && this.dataArray()) {
			return this.dataArray().find(
				(d) =>
					d.enumValue === this.enumValue() ||
					(typeof this.enumValue() === 'string' && d.enumValue.toString() === this.enumValue())
			);
		}

		return undefined;
	});

}
