import { OrderStatus } from "../enums/order-status.enum";

export interface CreateOrderDto {
    id?: number;
    supplierId: number;
    date: string;
    status: OrderStatus; 
    notes?: string;
    products?: {
        productId: number;
        name: string;
        quantity: number;
        categoryId?: number;
        categoryName?: string
    }[];
}