// src/app/pipes/hebrew-date.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { parseDateStringAsLocal } from '../common/utils/date.utils';

@Pipe({
  name: 'hebrewDate',
  standalone: true,
})
export class HebrewDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value ?? '';
    }
    try {
      const date = parseDateStringAsLocal(value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return value;
    }
  }
}