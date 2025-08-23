import { OrderStatus, orderStatusData } from '../common/enums/order-status.enum';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'orderStatusLabel',
	standalone: true,
})
export class OrderStatusPipe implements PipeTransform {
	transform(OrderStatus: OrderStatus): string {
		const foundData = orderStatusData.find((data) => data.enumValue === OrderStatus);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'orderStatusIcon',
	standalone: true,
})
export class OrderStatusIconPipe implements PipeTransform {
	transform(orderStatus: OrderStatus): string {
		const foundData = orderStatusData.find((data) => data.enumValue === orderStatus);
		return foundData && foundData.icon ? foundData.icon : '';
	}
}

@Pipe({
	name: 'orderStatusColor',
	standalone: true,
})
export class OrderStatusColorPipe implements PipeTransform {
	transform(orderStatus: OrderStatus): string {
		const foundData = orderStatusData.find((data) => data.enumValue === orderStatus);
		return foundData && foundData.tailwind ? foundData.tailwind : '';
	}
}

