import { Component, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ColumnSettingsComponent } from '../shared/column-settings/column-settings.component';
import { ColumnSelectComponent } from "../shared/column-select/column-select.component";
import { ResponsiveColumnSettingsComponent } from "../shared/responsive-column-settings/responsive-column-settings.component";
import { ExcelExportService, ExportColumn } from '../../services/excel-export.service';
import { TooltipModule } from 'primeng/tooltip';
import { ExcelImportComponent } from "../shared/excel-import/excel-import.component";
import { ExcelImportService } from '../../services/excel-import.service';
import { NotificationService } from '../../services/notification.service';
import { ColumnDefinition } from '../users/users.component';

// User interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  isActive: boolean;
  phone: string;
  address: string;
  occupation: string;
  registrationDate: string;
  lastLogin: string;
}

// Column interface specific to User, but compatible with ColumnDefinition
interface UserColumn extends ColumnDefinition {
  key: keyof User;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [TableModule, CheckboxModule, ButtonModule, DragDropModule,
    FormsModule, ColumnSettingsComponent, ColumnSelectComponent, ResponsiveColumnSettingsComponent,
    TooltipModule, ExcelImportComponent],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css'],
  animations: []
})
export class UserTableComponent {

  private excelExportService = inject(ExcelExportService);
  private excelImportService = inject(ExcelImportService);
  private notificationService = inject(NotificationService);

  isImporting = signal(false); 
  users = signal<User[]>([]);


  // Signal for dynamic columns with visibility
  columns = signal<UserColumn[]>([
    { key: 'id', header: 'מזהה', visible: true, disabled: true },
    { key: 'firstName', header: 'שם פרטי', visible: true, disabled: true },
    { key: 'lastName', header: 'שם משפחה', visible: true, disabled: true },
    { key: 'email', header: 'דוא"ל', visible: true },
    { key: 'age', header: 'גיל', visible: true },
    { key: 'isActive', header: 'פעיל', visible: true },
    { key: 'phone', header: 'טלפון', visible: true },
    { key: 'address', header: 'כתובת', visible: true },
    { key: 'occupation', header: 'מקצוע', visible: true },
    { key: 'registrationDate', header: 'תאריך הרשמה', visible: true },
    { key: 'lastLogin', header: 'כניסה אחרונה', visible: true }
  ]);

  onColumnsUpdated(updatedColumns: ColumnDefinition[]): void {
    this.columns.set(updatedColumns as UserColumn[]);
  }

  saveColumnSettings(finalColumns: ColumnDefinition[]): void {
    const columnSettings = finalColumns.map((col, index) => ({
      key: col.key,
      visible: col.visible,
      disabled: !!col.disabled,
      order: index,
    }));

    console.log('Saving column settings to the server:', columnSettings);
    // this.http.post('/api/user-table-settings', columnSettings).subscribe();
  }


  exportTableToExcel(): void {
    const visibleColumns = this.columns().filter(col => col.visible);
    const dataToExport = this.users();

    // Map the visible columns to the format required by the export service
    const exportColumns: ExportColumn[] = visibleColumns.map(col => ({
      key: col.key,
      header: col.header,
      // Add a specific transformer for the 'isActive' column
      transform: col.key === 'isActive'
        ? ExcelExportService.transformers.booleanToHebrew
        : undefined
    }));

    // Call the service to perform the export
    this.excelExportService.exportToExcel(dataToExport, exportColumns, {
      fileName: 'user_data_export',
      sheetName: 'Users',
      includeTimestamp: true
    });
  }

async onDataImported(rawData: any[]): Promise<void> {
    console.log('Raw data received:', rawData);

    // Provide existing data and the unique key to the processing service
    const { validRows, invalidRows } = this.excelImportService.processImportedData<User>(
      rawData,
      this.columns(),
      this.users(), // <-- Pass existing data
      'id'          // <-- Specify the unique key
    );

    console.log('Processed valid rows:', validRows);
    
    if (invalidRows.length > 0) {
      // Create a more detailed error message
      const errorDetails = invalidRows.map(e => e.reason).join('\n');
      console.error('Invalid rows found:', invalidRows);
      this.notificationService.toast({
        severity: 'warn',
        summary: `נמצאו ${invalidRows.length} שורות לא תקינות`,
        detail: 'שורות אלו לא יובאו. ראה קונסול לפרטים.',
        life: 7000 // Longer life for more complex messages
      });
    }

    if (validRows.length > 0) {
      await this.handleBulkInsert(validRows);
    } else if (invalidRows.length === 0) {
      this.notificationService.toast({
        severity: 'info',
        summary: 'אין נתונים חדשים',
        detail: 'הקובץ שהועלה ריק או לא מכיל נתונים חדשים.'
      });
    }
  }

  private async handleBulkInsert(usersToInsert: User[]): Promise<void> {
    this.isImporting.set(true);
    this.notificationService.toast({
      severity: 'info',
      summary: 'שומר נתונים...',
      detail: `שולח ${usersToInsert.length} רשומות חדשות לשרת.`
    });

    try {
      // ===================================================================
      // ==                PLACEHOLDER FOR SERVER CALL                  ==
      // ===================================================================
      // In a real application, you would uncomment and use your API service here.
      // const response = await this.userService.bulkInsert(usersToInsert).toPromise();

      // Simulating a network request delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Data that would be sent to the server:', usersToInsert);
      // ===================================================================

      // On success, update the local state.
      // It's a best practice to update the UI only after the server confirms success.
      this.users.update(currentUsers => [...currentUsers, ...usersToInsert]);

      this.notificationService.toast({
        severity: 'success',
        summary: 'הייבוא הושלם',
        detail: `נוספו בהצלחה ${usersToInsert.length} משתמשים חדשים.`
      });

    } catch (error) {
      console.error('Error during bulk insert:', error);
      this.notificationService.toast({
        severity: 'error',
        summary: 'שגיאת שרת',
        detail: 'לא ניתן היה לשמור את הנתונים. נסה שוב מאוחר יותר.'
      });
    } finally {
      this.isImporting.set(false); // Hide the loader regardless of success or failure
    }
  }

}





export const UserData: User[] = [
  { id: 1, firstName: 'יוסי', lastName: 'כהן', email: 'yossi.cohen@example.com', age: 28, isActive: true, phone: '050-1234567', address: 'הרצל 10, תל אביב', occupation: 'מהנדס תוכנה', registrationDate: '2023-01-15', lastLogin: '2025-09-01' },
  { id: 2, firstName: 'שרה', lastName: 'לוי', email: 'sarah.levi@example.com', age: 34, isActive: false, phone: '052-2345678', address: 'אבן גבירול 20, תל אביב', occupation: 'רופאה', registrationDate: '2022-06-22', lastLogin: '2025-08-30' },
  { id: 3, firstName: 'דניאל', lastName: 'מזרחי', email: 'daniel.mizrahi@example.com', age: 19, isActive: true, phone: '053-3456789', address: 'הירקון 5, תל אביב', occupation: 'סטודנט', registrationDate: '2024-03-10', lastLogin: '2025-09-02' },
  { id: 4, firstName: 'רחל', lastName: 'גולן', email: 'rachel.golan@example.com', age: 45, isActive: true, phone: '054-4567890', address: 'בן יהודה 15, תל אביב', occupation: 'עורכת דין', registrationDate: '2021-11-05', lastLogin: '2025-08-29' },
  { id: 5, firstName: 'איתן', lastName: 'שפירא', email: 'eitan.shapira@example.com', age: 30, isActive: false, phone: '057-5678901', address: 'דיזנגוף 25, תל אביב', occupation: 'מנהל שיווק', registrationDate: '2023-07-19', lastLogin: '2025-08-28' },
  { id: 6, firstName: 'מיכל', lastName: 'אדלר', email: 'michal.adler@example.com', age: 27, isActive: true, phone: '058-6789012', address: 'רוטשילד 30, תל אביב', occupation: 'מעצבת גרפית', registrationDate: '2023-04-12', lastLogin: '2025-09-03' },
  { id: 7, firstName: 'אבי', lastName: 'ברק', email: 'avi.barak@example.com', age: 40, isActive: false, phone: '059-7890123', address: 'שדרות ירושלים 12, ירושלים', occupation: 'מורה', registrationDate: '2022-09-01', lastLogin: '2025-08-25' },
  { id: 8, firstName: 'ליאור', lastName: 'כץ', email: 'lior.katz@example.com', age: 33, isActive: true, phone: '050-8901234', address: 'השלום 8, חיפה', occupation: 'חשמלאי', registrationDate: '2023-02-20', lastLogin: '2025-09-01' },
  { id: 9, firstName: 'נועה', lastName: 'פרץ', email: 'noa.peretz@example.com', age: 22, isActive: true, phone: '052-9012345', address: 'הנביאים 4, ירושלים', occupation: 'סטודנטית', registrationDate: '2024-01-10', lastLogin: '2025-09-02' },
  { id: 10, firstName: 'עומר', lastName: 'רונן', email: 'omer.ronen@example.com', age: 29, isActive: false, phone: '053-0123456', address: 'אלנבי 18, תל אביב', occupation: 'מתכנת', registrationDate: '2023-05-15', lastLogin: '2025-08-31' },
  { id: 11, firstName: 'תמר', lastName: 'שדה', email: 'tamar.sade@example.com', age: 36, isActive: true, phone: '054-1234567', address: 'הר סיני 7, אילת', occupation: 'מנהלת פרויקטים', registrationDate: '2022-12-01', lastLogin: '2025-09-01' },
  { id: 12, firstName: 'אורי', lastName: 'גל', email: 'uri.gal@example.com', age: 31, isActive: true, phone: '057-2345678', address: 'הרצליה 9, הרצליה', occupation: 'מהנדס חומרה', registrationDate: '2023-03-25', lastLogin: '2025-09-03' },
  { id: 13, firstName: 'הילה', lastName: 'מלכה', email: 'hila.malka@example.com', age: 25, isActive: false, phone: '058-3456789', address: 'שדרות בן גוריון 3, נתניה', occupation: 'צלמת', registrationDate: '2023-08-10', lastLogin: '2025-08-30' },
  { id: 14, firstName: 'יונתן', lastName: 'אור', email: 'yonatan.or@example.com', age: 38, isActive: true, phone: '059-4567890', address: 'העצמאות 22, באר שבע', occupation: 'רואה חשבון', registrationDate: '2022-10-15', lastLogin: '2025-09-02' },
  { id: 15, firstName: 'דנה', lastName: 'שטיין', email: 'dana.stein@example.com', age: 26, isActive: true, phone: '050-5678901', address: 'הגליל 14, חיפה', occupation: 'עיתונאית', registrationDate: '2023-06-05', lastLogin: '2025-09-01' },
  { id: 16, firstName: 'גיא', lastName: 'נחום', email: 'guy.nachum@example.com', age: 41, isActive: false, phone: '052-6789012', address: 'שדרות רוטשילד 6, תל אביב', occupation: 'שף', registrationDate: '2022-07-20', lastLogin: '2025-08-29' },
  { id: 17, firstName: 'שירי', lastName: 'בלום', email: 'shiri.bloom@example.com', age: 23, isActive: true, phone: '053-7890123', address: 'הירדן 11, תל אביב', occupation: 'סטודנטית', registrationDate: '2024-02-10', lastLogin: '2025-09-03' },
  { id: 18, firstName: 'אריאל', lastName: 'גוטמן', email: 'ariel.gutman@example.com', age: 35, isActive: true, phone: '054-8901234', address: 'הכרמל 17, חיפה', occupation: 'אדריכל', registrationDate: '2023-01-30', lastLogin: '2025-09-02' },
  { id: 19, firstName: 'ליהי', lastName: 'כרמי', email: 'lihi.carmi@example.com', age: 29, isActive: false, phone: '057-9012345', address: 'השופטים 5, רמת גן', occupation: 'מפיקת אירועים', registrationDate: '2023-04-25', lastLogin: '2025-08-31' },
  { id: 20, firstName: 'עידן', lastName: 'שמש', email: 'idan.shemesh@example.com', age: 32, isActive: true, phone: '058-0123456', address: 'החשמונאים 9, תל אביב', occupation: 'מנהל מכירות', registrationDate: '2023-09-15', lastLogin: '2025-09-01' }
]