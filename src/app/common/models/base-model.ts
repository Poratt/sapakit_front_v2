import { Status } from '../enums/status.enum';

export interface BaseModel {
	id: number;
	// status?: Status;
	createdBy?: string;
	isDeleted?: boolean;
	createdAt: Date;
	updatedAt?: Date;
}
