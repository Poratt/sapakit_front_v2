import { Order } from './order';
import { OrderType } from '../enums/order-type';
import { ReminderType } from '../enums/reminderType';
import { BaseModel } from './base-model';
import { Category } from './category';
import { Product } from './product';
import { Status } from '../enums/status.enum';

export interface Supplier extends BaseModel {
	name: string;
	status: Status;
	phone: string;
	orderType: OrderType;
	reminderType: ReminderType;
	orderDays: number[];
	orderDates: number[];
	email?: string;
	image?: string;
	categories?: Category[];
	orders?: Order[];
	products?: Product[];
}

// export const SUPPLIERS_MOCK = [
//     {
//         id: 1,
//         name: 'ספק ראשון',
//         phone: '0501234567',
//         orderType: OrderType.ByDay,
//         orderDays: [1, 3, 5],
//         orderDates: [],
//         reminderType: ReminderType.EachTime,
//     },
//     {
//         id: 2,
//         name: 'ספק שני',
//         phone: '0527654321',
//         orderType: OrderType.ByDate,
//         orderDays: [],
//         orderDates: [5, 10, 15],
//         reminderType: ReminderType.UntilOrderDone,
//     },
//     {
//         id: 3,
//         name: 'ספק שלישי',
//         phone: '0539876543',
//         orderType: OrderType.ByDay,
//         orderDays: [2, 4],
//         orderDates: [],
//         reminderType: ReminderType.EachTime,
//     },
//     {
//         id: 4,
//         name: 'ספק רביעי',
//         phone: '0543219876',
//         orderType: OrderType.ByDate,
//         orderDays: [],
//         orderDates: [1, 11, 21],
//         reminderType: ReminderType.UntilOrderDone,
//     },
//     {
//         id: 5,
//         name: 'ספק חמישי',
//         phone: '0556547890',
//         orderType: OrderType.ByDay,
//         orderDays: [6],
//         orderDates: [],
//         reminderType: ReminderType.EachTime,
//     },
// ];
