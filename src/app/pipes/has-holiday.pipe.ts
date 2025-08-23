import { Pipe, PipeTransform } from '@angular/core';
import { DayDisplay } from '../components/calendar/advanced-calendar/advanced-calendar.component';

@Pipe({
  name: 'hasHoliday',
  standalone: true
})
export class HasHolidayPipe implements PipeTransform {
  transform(days: DayDisplay[]): boolean {
    return days.some(day => day.holiday && !day.fast && !day.shabbat);
  }
}

@Pipe({
  name: 'findHoliday',
  standalone: true
})
export class FindHolidayPipe implements PipeTransform {
  transform(days: DayDisplay[]): string {
    const holidayDay = days.find(day => day.holiday && !day.fast && !day.shabbat);
    return holidayDay?.holiday || '';
  }
}