import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
	DateAdapter,
	MAT_DATE_LOCALE,
	MatNativeDateModule,
	NativeDateAdapter,
	NativeDateModule,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export const FormModules = [
	FormsModule,
	ReactiveFormsModule,
	MatDatepickerModule,
	MatFormFieldModule,
	MatSelectModule,
	MatInputModule,
	MatTooltipModule,
	MatCheckboxModule,
	MatRadioModule,
	MatSliderModule,
	MatSlideToggleModule,
	MatAutocompleteModule,
	DragDropModule,
	MatIconModule,
	MatMenuModule,
];
export const TableModules = [MatTableModule, MatPaginatorModule, MatSortModule];
export const DatePickerModules = [MatDatepickerModule];
