import { Component, Input, Output, EventEmitter, forwardRef, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { defaultCategories, IconCategory } from '../../../common/const/prime-icons';



@Component({
  selector: 'app-icon-selector',
  standalone: true,
  imports: [CommonModule, MatTabsModule],
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconSelectorComponent),
      multi: true
    }
  ]
})
export class IconSelectorComponent implements ControlValueAccessor, OnInit {
  @Input() size: 'small' | 'medium' | 'large' = 'small';
  @Input() showIconName = true;
  @Input() showCategoryTabs = true;
  @Input() disabled = false;
  @Input() placeholder = 'בחר אייקון';
  @Input() categories: IconCategory[] = [];
  
  @Output() iconChange = new EventEmitter<string>();

  private _value = signal('');
  private onChange = (value: string) => {};
  private onTouched = () => {};

  currentIconIndex = signal(0);
  currentCategoryIndex = 0;
  availableIcons: string[] = [];

  currentIcon = computed(() => {
      return this.availableIcons[this.currentIconIndex()] || 'pi pi-circle';
  });
  
  defaultCategories: IconCategory[] = defaultCategories;

  ngOnInit(): void {
    this.setupCategories();
    this.setupInitialIcon();
  }

  private setupCategories(): void {
    const categoriesToUse = this.categories.length > 0 ? this.categories : this.defaultCategories;
    
    if (this.showCategoryTabs) {
      this.availableIcons = categoriesToUse[0]?.icons || [];
    } else {
      this.availableIcons = categoriesToUse.reduce((acc: string[], category) => {
        return acc.concat(category.icons);
      }, []);
    }
  }

  private setupInitialIcon(): void {
    const currentValue = this._value();
    if (currentValue && this.availableIcons.includes(currentValue)) {
      this.currentIconIndex.set(this.availableIcons.indexOf(currentValue));
    } else if (this.availableIcons.length > 0) {
      this.currentIconIndex.set(0);
      this.updateValue(this.currentIcon());
    }
  }

  get currentCategories(): IconCategory[] {
    return this.categories.length > 0 ? this.categories : this.defaultCategories;
  }

  selectCategory(categoryIndex: number): void {
    if (categoryIndex !== this.currentCategoryIndex) {
      this.currentCategoryIndex = categoryIndex;
      this.availableIcons = this.currentCategories[categoryIndex].icons;
      this.currentIconIndex.set(0);
      this.updateValue(this.currentIcon());
    }
  }

  previousIcon(): void {
    if (this.disabled) return;
    this.currentIconIndex.update(index => 
        index > 0 ? index - 1 : this.availableIcons.length - 1
    );
    this.updateValue(this.currentIcon());
    this.onTouched();
  }

  nextIcon(): void {
    if (this.disabled) return;
    this.currentIconIndex.update(index => 
        index < this.availableIcons.length - 1 ? index + 1 : 0
    );
    this.updateValue(this.currentIcon());
    this.onTouched();
  }

  updateValue(value: string): void {
    if (this._value() === value) return;
    this._value.set(value);
    const newIndex = this.availableIcons.indexOf(value);
    if (newIndex > -1) {
        this.currentIconIndex.set(newIndex);
    }
    this.onChange(value);
    this.iconChange.emit(value);
  }

  writeValue(value: string): void {
    this._value.set(value || '');
    if (this.availableIcons.length > 0) {
        const index = this.availableIcons.indexOf(this._value());
        if (index > -1) {
            this.currentIconIndex.set(index);
        }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}