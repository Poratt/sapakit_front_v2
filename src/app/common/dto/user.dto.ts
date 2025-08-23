import { Status } from "../enums/status.enum";
import { UserRole } from "../enums/userRole.enum";

export interface UserDto {
	id?: number;
	email: string;
	username: string;
	phone?: string;
	password: string;
	role: UserRole;
	image?: string;
	status?: Status;
}