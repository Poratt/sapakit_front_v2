import { AccountTier } from '../enums/account-tier.enums';
import { User } from './user';

export interface Account {
	id: number;
	name: string;
	tier: AccountTier;
	ownerId: number;
	owner?: User;
	users?: User[];
	supplierCount?: number; 
	categoryCount?: number; 
	productCount?: number; 
	createdAt: Date;
	updatedAt: Date;
}