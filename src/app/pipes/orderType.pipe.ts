import { Pipe, PipeTransform } from '@angular/core';
import { OrderType, orderTypeData } from '../common/enums/order-type';

@Pipe({
	name: 'orderType',
	standalone: true,
})
export class OrderTypePipe implements PipeTransform {
	transform(orderType: OrderType): string {
		const foundData = orderTypeData.find((data) => data.enumValue === orderType);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'orderTypeIcon',
	standalone: true,
})
export class OrderTypeIconPipe implements PipeTransform {
	transform(orderType: OrderType): string {
		const foundData = orderTypeData.find((data) => data.enumValue === orderType);
		return foundData && foundData.icon ? foundData.icon : '';
	}
}

@Pipe({
	name: 'orderTypeColor',
	standalone: true,
})
export class OrderTypeColorPipe implements PipeTransform {
	transform(orderType: OrderType): string {
		const foundData = orderTypeData.find((data) => data.enumValue === orderType);
		return foundData && foundData.tailwind ? foundData.tailwind : '';
	}
}
