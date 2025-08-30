import { Status } from "../enums/status.enum";
import { UserRole } from "../enums/userRole.enum";

export interface CreateUserDto {
	// id?: number;
	email: string;
	username: string;
	password: string;
	accountName: string;
	// phone?: string;
	// role: UserRole;
	// image?: string;
	// status?: Status;
}