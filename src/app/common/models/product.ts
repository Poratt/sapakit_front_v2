import { Package } from '../enums/package';
import { Status } from '../enums/status.enum';
import { BaseModel } from './base-model';

export interface Product extends BaseModel {
	name: string;
	categoryId: number;
	categoryName: string;
	package: Package;
	cost: number;
	price: number;
	quantity: number | null;
	status: Status;
	supplierId: number;
	notes?: string;
	imageUrl?: string;
	position: number;
}

// export const mockProducts: Product[] = [
//     {
//         id: 1,
//         name: "Apple",
//         categoryId: 8,
//         supplierId: 4,
//         status: Status.Active,
//         createdAt: new Date("2025-01-01"),
//         updatedAt: new Date("2025-01-05"),
//     },
//     {
//         id: 7,
//         name: "Cereal",
//         categoryId: 18,
//         supplierId: 4,
//         status: Status.Active,
//         createdAt: new Date("2025-01-07"),
//         updatedAt: new Date("2025-01-11"),
//     },
//     {
//         id: 9,
//         name: "Milk",
//         categoryId: 18,
//         supplierId: 4,
//         status: Status.Active,
//         createdAt: new Date("2025-01-09"),
//         updatedAt: new Date("2025-01-13"),
//     },
//     {
//         id: 10,
//         name: "Cheese",
//         categoryId: 18,
//         supplierId: 4,
//         status: Status.Inactive,
//         createdAt: new Date("2025-01-10"),
//         updatedAt: new Date("2025-01-14"),
//     },
//     {
//         id: 11,
//         name: "Bread",
//         categoryId: 18,
//         supplierId: 5,
//         status: Status.Active,
//         createdAt: new Date("2025-01-12"),
//         updatedAt: new Date("2025-01-15"),
//     },
// ];
