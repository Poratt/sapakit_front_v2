// src/app/services/data-processing.service.ts
import { Injectable } from '@angular/core';

// Re-using the same interface from the table component for consistency
export interface ColumnDefinition {
	key: string;
	header: string;
	// We can add validation rules here in the future
	// e.g., type: 'string' | 'number' | 'boolean'; required: boolean;
}

export interface ProcessedData<T> {
	validRows: T[];
	invalidRows: any[]; // Rows that failed validation
	errors: string[];
}

@Injectable({
	providedIn: 'root'
})
export class ExcelImportService {

	processImportedData<T extends { [key: string]: any }>(
		rawData: any[],
		columns: ColumnDefinition[],
		existingData: T[],
		uniqueKey: keyof T
	): ProcessedData<T> {

		const validRows: T[] = [];
		const invalidRows: { row: any, reason: string }[] = [];
		const errors: string[] = [];


		const headerToKeyMap = new Map<string, string>();
		columns.forEach(col => headerToKeyMap.set(col.header, col.key));

		// --- DUPLICATION CHECK SETUP ---
		// 1. A set for quick lookup of keys that already exist in the system.
		const existingKeys = new Set(existingData.map(item => item[uniqueKey]));
		// 2. A set to track keys encountered within the current import file.
		const keysInThisFile = new Set();

		rawData.forEach((rawRow, index) => {
			const rowIndex = index + 2; // For user-friendly error messages (Excel rows start at 1, +1 for header)
			let reason = '';

			// --- Map headers to keys ---
			const processedRow: { [key: string]: any } = {};
			for (const header in rawRow) {
				if (headerToKeyMap.has(header)) {
					const key = headerToKeyMap.get(header)!;
					processedRow[key] = this.transformValue(key, rawRow[header]);
				}
			}

			// --- VALIDATION LOGIC ---
			const uniqueValue = processedRow[uniqueKey as string];

			if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
				reason = `שדה המפתח ('${uniqueKey as string}') ריק.`;
			}
			// Check for duplicates within the file itself
			else if (keysInThisFile.has(uniqueValue)) {
				reason = `כפילות בקובץ: המפתח '${uniqueValue}' כבר קיים בשורה קודמת.`;
			}
			// Check for duplicates against existing system data
			else if (existingKeys.has(uniqueValue)) {
				reason = `כפילות במערכת: המפתח '${uniqueValue}' כבר קיים במערכת.`;
			}

			const fullReasonString = `שורה ${rowIndex}: ${reason}`;

			if (reason) {
				invalidRows.push({ row: rawRow, reason: fullReasonString });

				errors.push(fullReasonString);

			} else {
				validRows.push(processedRow as T);
				keysInThisFile.add(uniqueValue); // Add to the set for future checks in this file
			}
		});

		return { validRows, invalidRows, errors };
	}



	private transformValue(key: string, value: any): any {
		if (typeof value === 'string') {
			value = value.trim();
		}

		// Example of specific transformation for boolean values
		if (key.toLowerCase().includes('isactive')) {
			if (typeof value === 'string') {
				const lowerValue = value.toLowerCase();
				if (lowerValue === 'כן' || lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1') {
					return true;
				}
				return false;
			}
			return Boolean(value);
		}

		// Can add date transformations here as well
		// if (key.toLowerCase().includes('date')) {
		//   return new Date(value);
		// }

		return value;
	}
}