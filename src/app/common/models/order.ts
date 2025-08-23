import { OrderStatus } from '../enums/order-status.enum';
import { BaseModel } from './base-model';

export interface Order extends BaseModel {
	id: number;
	supplierId: number;
	date: string;
	status: OrderStatus;
	orderProducts?: OrderProductItem[] | null;
	supplierName?: string;
	notes?: string;
}

export interface OrderProductItem {
	id: number;
	productId: number;
	name: string;
	cost?: number;
	price?: number;
	quantity: number;
	categoryId?: number; // Added for category view
	categoryName?: string; // Added for category view
}

//     totalAmount: number;
//     status: OrderStatus;

//     orderDate?: string;
//     isDuplicateToday: boolean;
//     supplier: { id: number; name?: string };
//     user: { id: number };
//     comment?: string;
//     orderProducts: OrderProduct[];
//     isSelected?: boolean;
// }

// export interface OrderProduct {
//     id: number;
//     product: Product
//     quantity: number;

// }

// export interface Reminder {
//     text: string;
// }
