import { Pipe, PipeTransform } from '@angular/core';
import { OrderViewStatus, orderViewStatusData } from '../common/enums/order-status.enum';

@Pipe({
	name: 'orderViewStatusLabel',
	standalone: true,
})
export class OrderViewStatusPipe implements PipeTransform {
	transform(orderViewStatus: OrderViewStatus | null): string {
		if (!orderViewStatus) return 'לא נבחר';
		const foundData = orderViewStatusData.find((data) => data.enumValue === orderViewStatus);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'orderViewStatusIcon',
	standalone: true,
})
export class OrderViewStatusIconPipe implements PipeTransform {
	transform(orderViewStatus: OrderViewStatus | null): string {
		if (!orderViewStatus) return 'pi pi-question';
		const foundData = orderViewStatusData.find((data) => data.enumValue === orderViewStatus);
		return foundData && foundData.icon ? foundData.icon : 'pi pi-question';
	}
}

@Pipe({
	name: 'orderViewStatusColor',
	standalone: true,
})
export class OrderViewStatusColorPipe implements PipeTransform {
	transform(orderViewStatus: OrderViewStatus | null): string {
		if (!orderViewStatus) return 'bg-gray-50';
		const foundData = orderViewStatusData.find((data) => data.enumValue === orderViewStatus);
		return foundData && foundData.background ? foundData.background : 'bg-gray-50';
	}
}
