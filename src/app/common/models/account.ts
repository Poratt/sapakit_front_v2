import { User } from './user';
import { AccountTier } from './account-tier.model';

export interface Account {
	id: number;
	name: string;
	tierId?: number; // זה השדה שמגיע עם היוזר
    tier?: AccountTier; // זה השדה שמגיע משאילתות אחרות
	ownerId: number;
	owner?: User;
	users?: User[];
	supplierCount?: number;
	categoryCount?: number;
	productCount?: number;
	createdAt: Date;
	updatedAt: Date;
}