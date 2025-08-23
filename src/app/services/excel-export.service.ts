import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportColumn {
	key: string;
	header: string;
	transform?: (value: any) => string;
}

export interface ExportOptions {
	fileName?: string;
	sheetName?: string;
	includeTimestamp?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class ExcelExportService {
	/**
	 * Export data to an Excel file
	 * @param data - The array of data to export
	 * @param columns - Column definitions
	 * @param options - Additional export options
	 */
	exportToExcel<T>(data: T[], columns: ExportColumn[], options: ExportOptions = {}): void {
		if (!data || data.length === 0) {
			console.warn('No data to export');
			return;
		}

		try {
			// Prepare data for export
			const exportData = this.prepareDataForExport(data, columns);

			// Create worksheet
			const worksheet = XLSX.utils.json_to_sheet(exportData);

			// Set column widths
			this.setColumnWidths(worksheet, columns);

			// Create workbook
			const workbook = XLSX.utils.book_new();
			const sheetName = options.sheetName || 'Data';
			XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

			// Generate file name
			const fileName = this.generateFileName(options.fileName, options.includeTimestamp);

			// Save the file
			XLSX.writeFile(workbook, fileName);
		} catch (error) {
			console.error('Error exporting to Excel:', error);
			throw new Error('Failed to export data');
		}
	}

	/**
	 * Quick export using default column settings
	 * @param data - Data to export
	 * @param fileName - File name
	 */
	quickExport<T>(data: T[], fileName?: string): void {
		if (!data || data.length === 0) return;

		const columns = this.generateColumnsFromData(data[0]);
		this.exportToExcel(data, columns, { fileName });
	}

	private prepareDataForExport<T>(data: T[], columns: ExportColumn[]): any[] {
		return data.map((item) => {
			const exportItem: any = {};

			columns.forEach((column) => {
				const value = this.getNestedValue(item, column.key);
				exportItem[column.header] = column.transform
					? column.transform(value)
					: this.formatValue(value);
			});

			return exportItem;
		});
	}

	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((current, key) => current?.[key], obj);
	}

	private formatValue(value: any): string {
		if (value === null || value === undefined) return '';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		if (value instanceof Date) return value.toLocaleDateString('he-IL');
		return String(value);
	}

	private setColumnWidths(worksheet: XLSX.WorkSheet, columns: ExportColumn[]): void {
		const colWidths = columns.map((col) => ({
			wch: Math.max(col.header.length, 15),
		}));
		worksheet['!cols'] = colWidths;
	}

	private generateColumnsFromData<T>(sampleData: T): ExportColumn[] {
		if (!sampleData) return [];

		return Object.keys(sampleData as object).map((key) => ({
			key,
			header: key,
		}));
	}

	private generateFileName(customName?: string, includeTimestamp?: boolean): string {
		const baseName = customName || 'export';
		const timestamp = includeTimestamp
			? `_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`
			: '';
		return `${baseName}${timestamp}.xlsx`;
	}

	/**
	 * Common transformation helpers
	 */
	static transformers = {
		// For enum values
		enumToText: (enumData: any[]) => (value: any) => {
			const item = enumData.find((e) => e.enumValue === value);
			return item?.label || value;
		},

		// For dates
		dateFormat:
			(format: 'short' | 'long' = 'short') =>
			(value: Date | string) => {
				if (!value) return '';
				const date = new Date(value);
				return format === 'short'
					? date.toLocaleDateString('he-IL')
					: date.toLocaleString('he-IL');
			},

		// For numbers
		numberFormat:
			(decimals: number = 2) =>
			(value: number) => {
				if (typeof value !== 'number') return value;
				return value.toFixed(decimals);
			},

		// For booleans
		booleanToHebrew: (value: boolean) => (value ? 'כן' : 'לא'),

		// For arrays
		arrayToString:
			(separator: string = ', ') =>
			(value: any[]) => {
				if (!Array.isArray(value)) return value;
				return value.join(separator);
			},
	};
}
