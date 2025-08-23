import { Status } from '../enums/status.enum';
import { UserRole } from '../enums/userRole.enum';
import { BaseModel } from './base-model';

export interface User extends BaseModel {
	username: string;
	status: Status;
	email: string;
	password: string;
	role: UserRole;
	phone: string;
	image?: string;
}

export interface UserForCreate {
	email: string;
	username: string;
	phone: string | null;
	password?: string;
	role: number;
	status: number;
	image: string | null;
}
