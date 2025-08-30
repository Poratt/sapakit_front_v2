import { User } from './user';

export interface Account {
	id: number;
	name: string;
	ownerId: number;
	owner?: User;
	users?: User[];
	createdAt: Date;
	updatedAt: Date;
}