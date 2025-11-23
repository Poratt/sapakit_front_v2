import { Component, output, model, signal, ViewChild, computed, inject, effect } from '@angular/core';
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
import { DividerModule } from 'primeng/divider';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { ColumnDefinition } from '../../users/users.component';



export enum ScreenSize {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
  Wide = 'wide',
  UltraWide = 'ultra-wide'
}

export const BREAK_POINTS = [
  { id: 'mobile', label: 'נייד', index: 1, icon: 'pi pi-mobile', maxColumns: 2 },
  { id: 'tablet', label: 'טאבלט', index: 3, icon: 'pi pi-tablet', maxColumns: 4 },
  { id: 'desktop', label: 'דסקטופ', index: 6, icon: 'pi pi-desktop', maxColumns: 6 },
  { id: 'wide', label: 'מסך רחב', index: 9, icon: 'pi pi-window-maximize', maxColumns: 8 },
  { id: 'ultra-wide', label: 'מסך ענק', index: 12, icon: 'pi pi-window-maximize', maxColumns: 12 },
];

@Component({
  selector: 'app-responsive-column-settings',
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
    DividerModule
  ],
  templateUrl: './responsive-column-settings.component.html',
  styleUrl: './responsive-column-settings.component.css'
})
export class ResponsiveColumnSettingsComponent {
  @ViewChild('op') popover!: Popover;

  private breakpointObserver = inject(BreakpointObserver);

  BREAK_POINTS = BREAK_POINTS;
  ScreenSize = ScreenSize;

  columns = model.required<ColumnDefinition[]>();
  save = output<ColumnDefinition[]>();
  draftColumns = signal<ColumnDefinition[]>([]);
  filterText = signal<string>('');

  breakpoints$ = toSignal(
    this.breakpointObserver.observe([
      '(max-width: 599px)',      // Mobile
      '(min-width: 600px) and (max-width: 959px)',   // Tablet
      '(min-width: 960px) and (max-width: 1439px)',  // Desktop
      '(min-width: 1440px) and (max-width: 1919px)', // Wide
      '(min-width: 1920px)'      // Ultra Wide
    ]),
    { initialValue: { matches: false, breakpoints: {} } as BreakpointState }
  );

  // קביעת גודל המסך הנוכחי
  currentScreenSize = computed(() => {
    const breakpoints = this.breakpoints$();
    if (!breakpoints) return ScreenSize.Desktop;

    if (breakpoints.breakpoints['(max-width: 599px)']) {
      return ScreenSize.Mobile;
    } else if (breakpoints.breakpoints['(min-width: 600px) and (max-width: 959px)']) {
      return ScreenSize.Tablet;
    } else if (breakpoints.breakpoints['(min-width: 960px) and (max-width: 1439px)']) {
      return ScreenSize.Desktop;
    } else if (breakpoints.breakpoints['(min-width: 1440px) and (max-width: 1919px)']) {
      return ScreenSize.Wide;
    } else {
      return ScreenSize.UltraWide;
    }
  });

  // עמודות מסוננות
  filteredColumns = computed(() => {
    const columns = this.draftColumns();
    const text = this.filterText().toLowerCase().trim();

    if (!text) {
      return columns;
    }

    return columns.filter(col =>
      col.header.toLowerCase().includes(text)
    );
  });

  constructor() {
    effect(() => {
      const screenSize = this.currentScreenSize();
      const currentColumns = this.columns();
      
      if (currentColumns.length > 0) {
        const updatedColumns = currentColumns.map(col => {
          // עדכון נראות לפי גודל מסך נוכחי
          const newVisible = this.shouldColumnBeVisible(col, screenSize);
          return { ...col, visible: newVisible };
        });

        // עדכון רק אם יש שינוי
        const hasChanged = updatedColumns.some((col, index) => 
          col.visible !== currentColumns[index].visible
        );

        if (hasChanged) {
          this.columns.set(updatedColumns);
        }
      }
    });
  }

  onPopoverShow(): void {
    // העתק את העמודות לעריכה
    this.draftColumns.set(JSON.parse(JSON.stringify(this.columns())));
    this.filterText.set('');
    
    // וודא שכל עמודה יש לה priority
    setTimeout(() => {
      this.draftColumns.update(columns => 
        columns.map((col, index) => ({
          ...col,
          priority: col.priority ?? index + 1
        }))
      );
    }, 0);
  }

  // קביעת נראות עמודה לפי גודל מסך
  private shouldColumnBeVisible(column: ColumnDefinition, screenSize: ScreenSize): boolean {
    if (column.disabled) return !!column.visible;

    const screenConfig = BREAK_POINTS.find(bp => bp.id === screenSize);
    if (!screenConfig) return !!column.visible;

    const columnPriority = column.priority ?? 999;
    return columnPriority <= screenConfig.index;
  }

  toggleColumnVisibility(column: ColumnDefinition): void {
    if (column.disabled) return;

    this.draftColumns.update((currentColumns) => {
      const updated = currentColumns.map((c) => {
        if (c.key === column.key) {
          return { ...c, visible: !c.visible, priority: c.visible ? undefined : (c.priority ?? currentColumns.length + 1) };
        }
        return c;
      });

      return this.sortVisibleFirst(updated);
    });
  }

  drop(event: CdkDragDrop<ColumnDefinition[]>): void {
    const targetItem = this.filteredColumns()[event.currentIndex];
    if (targetItem.disabled || !targetItem.visible) {
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
      
      // עדכן priorities לפי הסדר החדש
      return reorderedCols.map((col, index) => ({
        ...col,
        priority: index + 1
      }));
    });
  }

  getBpIcon(index: number): string {
    // מצא את נקודת השבירה האחרונה שהאינדקס גדול או שווה אליה
    const relevantBreakpoint = [...this.BREAK_POINTS]
      .reverse()
      .find(bp => index >= bp.index);
      
    return relevantBreakpoint ? relevantBreakpoint.icon : '';
  }
  
  sortVisibleFirst(columns: ColumnDefinition[]): ColumnDefinition[] {
    const visible = columns.filter(col => col.visible);
    const hidden = columns.filter(col => !col.visible);
    return [...visible, ...hidden];
  }

  // הצגת כמה עמודות יוצגו במסך הנוכחי
  getVisibleColumnsCount(): number {
    const currentScreen = this.currentScreenSize();
    const screenConfig = BREAK_POINTS.find(bp => bp.id === currentScreen);
    const maxColumns = screenConfig?.index ?? 6;
    
    return this.draftColumns().filter(col => 
      !col.disabled && (col.priority ?? 999) <= maxColumns
    ).length;
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