import { Component, output, model, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { fadeIn400 } from '../../../common/const/animations';
import { InputText } from "primeng/inputtext";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ColumnDefinition } from '../../users/users.component';



@Component({
  selector: 'app-column-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    PopoverModule,
    CheckboxModule,
    DragDropModule,
    TooltipModule,
    InputText,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './column-settings.component.html',
  styleUrls: ['./column-settings.component.css'],
  animations: [fadeIn400]
})
export class ColumnSettingsComponent {
  @ViewChild('op') popover!: Popover;

  columns = model.required<ColumnDefinition[]>();
  save = output<ColumnDefinition[]>();
  draftColumns = signal<ColumnDefinition[]>([]);

  filterText = signal<string>('');

  // A computed signal that derives the filtered list automatically
  filteredColumns = computed(() => {
    const columns = this.draftColumns();
    const text = this.filterText().toLowerCase().trim();

    if (!text) {
      return columns; // Return all columns if filter is empty
    }

    return columns.filter(col =>
      col.header.toLowerCase().includes(text)
    );
  });

  onPopoverShow(): void {
    // Deep copy to avoid mutating the original columns until save.
    this.draftColumns.set(JSON.parse(JSON.stringify(this.columns())));
    this.filterText.set('');
  }

  toggleColumnVisibility(column: ColumnDefinition): void {
    if (column.disabled) return;

    this.draftColumns.update((currentColumns) => {
      const updated = currentColumns.map((c) =>
        c.key === column.key ? { ...c, visible: !c.visible } : c
      );

      return this.sortVisibleFirst(updated);
    });
  }

  drop(event: CdkDragDrop<ColumnDefinition[]>): void {
    const targetItem = this.filteredColumns()[event.currentIndex];
    if (targetItem.disabled) {
      return;
    }

    this.draftColumns.update((currentColumns) => {
      const draggedItem = this.filteredColumns()[event.previousIndex];
      const originalPreviousIndex = currentColumns.findIndex(c => c.key === draggedItem.key);
      const originalCurrentIndex = currentColumns.findIndex(c => c.key === targetItem.key);
      if (originalPreviousIndex === -1 || originalCurrentIndex === -1) {
        return currentColumns;
      }

      const reorderedCols = [...currentColumns];
      moveItemInArray(reorderedCols, originalPreviousIndex, originalCurrentIndex);
      return reorderedCols;
    });
  }

  sortVisibleFirst(columns: ColumnDefinition[]): ColumnDefinition[] {
    const visible = columns.filter(col => col.visible);
    const hidden = columns.filter(col => !col.visible);
    return [...visible, ...hidden];
  }

  onSave(): void {
    this.columns.set(this.draftColumns());
    this.save.emit(this.columns());
    this.popover.hide();
  }

  onCancel(): void {
    this.popover.hide();
  }
}