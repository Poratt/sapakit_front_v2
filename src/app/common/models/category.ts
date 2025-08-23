import { Status } from '../enums/status.enum';
import { BaseModel } from './base-model';

export interface Category extends BaseModel {
	name: string;
	status: Status;
	supplierId: number;
	position: number;
}
