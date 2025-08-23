import { Status } from '../enums/status.enum';
import { Package } from '../enums/package';

// זה הכל! רק הגדרת הצורה של המידע.
export interface CreateProductDto {
  name: string;
  categoryId: number;
  supplierId: number;
  position: number;
  package: Package;
  cost?: number;
  status: Status;
  notes?: string;
  imageUrl?: string;
}