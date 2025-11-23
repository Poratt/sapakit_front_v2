import { Component, output, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { fadeIn400 } from '../../../common/const/animations';
import { ColumnDefinition } from '../../users/users.component';


@Component({
  selector: 'app-column-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    MultiSelectModule,
    DragDropModule,
  ],
  templateUrl: './column-select.component.html',
  styleUrls: ['./column-select.component.css'],
  animations: [fadeIn400]
})
export class ColumnSelectComponent {
  columns = model.required<ColumnDefinition[]>();
  save = output<ColumnDefinition[]>();
  draftColumns = signal<ColumnDefinition[]>([]);
  selectedColumns = signal<string[]>([]);

  onPopoverShow(): void {
    this.draftColumns.set(JSON.parse(JSON.stringify(this.columns())));
    this.selectedColumns.set(this.draftColumns().filter(col => col.visible && !col.disabled).map(col => col.key));
  }

  onSelectionChange(event: any): void {
    this.draftColumns.update((currentColumns) => {
      const updated = currentColumns.map((c) => ({
        ...c,
        visible: c.disabled ? c.visible : this.selectedColumns().includes(c.key)
      }));
      return this.sortVisibleFirst(updated);
    });
  }

  drop(event: CdkDragDrop<ColumnDefinition>): void {
    this.draftColumns.update((currentColumns) => {
      const reorderedCols = [...currentColumns];
      moveItemInArray(reorderedCols, event.previousIndex, event.currentIndex);
      return reorderedCols;
    });
  }

  sortVisibleFirst(columns: ColumnDefinition[]): ColumnDefinition[] {
    const visible = columns.filter(col => col.visible);
    const hidden = columns.filter(col => !col.visible);
    return [...visible, ...hidden];
  }

  getColumnHeader(key: string): string {
    const column = this.draftColumns().find(col => col.key === key);
    return column ? column.header : '';
  }

  onSave(): void {
    this.columns.set(this.draftColumns());
    this.save.emit(this.columns());
  }

  onCancel(): void {
    this.draftColumns.set([]);
    this.selectedColumns.set([]);
  }
}