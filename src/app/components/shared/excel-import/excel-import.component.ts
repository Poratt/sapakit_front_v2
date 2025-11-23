import { Component, inject, signal, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { LoaderComponent } from "../loader/loader.component";
import { NotificationService } from '../../../services/notification.service';
import { ExcelExportService, ExportColumn } from '../../../services/excel-export.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule, PopoverModule, ButtonModule, TooltipModule, LoaderComponent],
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.css'],
})
export class ExcelImportComponent {
  @ViewChild('op') popover!: Popover;

  templateColumns = input.required<ExportColumn[]>();
  // Output event to emit the successfully parsed data to the parent
  dataImported = output<any[]>();

	private notificationService = inject(NotificationService);
	private excelExportService = inject(ExcelExportService);

  isUploading = signal(false);
  isDraggingOver = signal(false);

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.isDraggingOver.set(true);
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		this.isDraggingOver.set(false);
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		this.isDraggingOver.set(false);
		const file = event.dataTransfer?.files[0];
		if (file) {
			this.processFile(file);
		}
	}

	onFileSelect(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			this.processFile(file);
		}
		input.value = '';
	}

	downloadTemplate(): void {
    if (!this.templateColumns() || this.templateColumns().length === 0) {
      this.notificationService.toast({ severity: 'warn', summary: 'לא הוגדרו עמודות' });
      return;
    }
		this.excelExportService.exportToExcel([], this.templateColumns(), {
			fileName: 'import_template',
			sheetName: 'Template'
		});
	}

  private async processFile(file: File): Promise<void> {
		if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
			this.notificationService.toast({
				severity: 'warn',
				summary: 'קובץ לא נתמך',
				detail: 'יש לבחור קובץ מסוג .xlsx או .xls בלבד.',
			});
			return;
		}

		this.isUploading.set(true);

		try {
			const data = await this.readFile(file);
			const workbook = XLSX.read(data, { type: 'array' });
			const sheetName = workbook.SheetNames[0];
			if (!sheetName) {
				throw new Error('קובץ האקסל ריק או לא תקין.');
			}
			const worksheet = workbook.Sheets[sheetName];

			// Validate headers before parsing all data
			this.validateHeaders(worksheet);

			// Convert sheet to JSON array
			const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Ensures dates are parsed correctly
        dateNF: 'dd/mm/yyyy'
      });

			console.log("File parsed successfully. Data:", jsonData);
			this.notificationService.toast({ severity: 'success', detail: 'הקובץ עבר ולידציה ונקרא בהצלחה.' });
			
			// Emit the data to the parent component
			this.dataImported.emit(jsonData);
      this.popover.hide();

		} catch (error: any) {
			this.notificationService.toast({
				severity: 'error',
				summary: 'שגיאה בעיבוד הקובץ',
				detail: error.message || 'אירעה שגיאה לא צפויה.',
			});
		} finally {
			this.isUploading.set(false);
		}
	}

  private readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

private validateHeaders(worksheet: XLSX.WorkSheet): void {
    // --- התיקון כאן ---
    // נקה את הכותרות הצפויות מרווחים
    const expectedHeaders = this.templateColumns().map(c => c.header.trim());
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // נקה את הכותרות מהקובץ מרווחים
    const actualHeaders = ((jsonData[0] as string[]) || []).map(h => h.trim());
    // ------------------

    console.groupCollapsed('%c[Excel Import] Header Validation', 'color: blue; font-weight: bold;');
    console.log('Expected Headers (Cleaned):', expectedHeaders);
    console.log('Actual Headers (Cleaned):', actualHeaders);
    
    const missingHeaders = expectedHeaders.filter(expected => !actualHeaders.includes(expected));

    if (missingHeaders.length > 0) {
        console.error('Missing Headers:', missingHeaders);
        console.groupEnd();
        throw new Error(`הכותרות הבאות חסרות או שגויות בקובץ: ${missingHeaders.join(', ')}`);
    }

    console.log('All headers found successfully!');
    console.groupEnd();
  }
}