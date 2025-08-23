import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { daysNames, IEventInfo, JewishCalendarService } from '../../../services/jewish-calendar.service';

export enum ScreenSizeEnum {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop'
}

export enum ViewModeEnum {
  Auto = 'auto',
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

interface DisplayedDay {
  date: Date;
  letter: string;
  name: string;
  formatted: string;
  isCurrent: boolean;
  holiday?: string;
  parasha?: string;
  fast?: string;
  shabbat?: { candleLighting?: string; havdalah?: string };
  zmanim: { sunrise?: string; sunset?: string; chatzot?: string; alotHashachar?: string };
}

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.css'],
  imports: [CommonModule]
})
export class CalendarDayComponent implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  private jewishCalendarService = inject(JewishCalendarService);
  private resizeObserver: ResizeObserver | undefined;

  currentDate = signal(new Date());
  today = new Date();
  screenSize = signal<ScreenSizeEnum>(ScreenSizeEnum.Mobile);
  viewMode = signal<ViewModeEnum>(ViewModeEnum.Auto);
  ViewModeEnum = ViewModeEnum
  ScreenSizeEnum = ScreenSizeEnum

  displayedDays = computed(() => this.getDisplayedDays());
  dayOfWeek = computed(() => this.getHebrewDay(this.currentDate().getDay()).name);
  formattedDate = computed(() => this.jewishCalendarService.getHebrewDate(
    this.currentDate().getFullYear(),
    this.currentDate().getMonth() + 1,
    this.currentDate().getDate()
  ));
  isToday = computed(() => this.currentDate().toDateString() === this.today.toDateString());

  ngOnInit() {
    this.jewishCalendarService.generateEvents();
    this.updateScreenSize();
    if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateScreenSize());
      this.resizeObserver.observe(this.document.body);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  prevDay() {
    this.updateDate(-1);
  }

  nextDay() {
    this.updateDate(1);
  }

  resetToToday() {
    this.currentDate.set(new Date());
  }

  setViewMode(mode: ViewModeEnum) {
    this.viewMode.set(mode);
  }

  private updateDate(offset: number) {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + offset);
    this.currentDate.set(newDate);
  }

  private updateScreenSize() {
    if (typeof window === 'undefined') {
      this.screenSize.set(ScreenSizeEnum.Mobile);
      return;
    }

    const width = this.document.defaultView?.innerWidth ?? 0;
    if (width >= 1024) {
      this.screenSize.set(ScreenSizeEnum.Desktop);
    } else if (width >= 768) {
      this.screenSize.set(ScreenSizeEnum.Tablet);
    } else {
      this.screenSize.set(ScreenSizeEnum.Mobile);
    }
  }

  private getDaysToShow(): number {
    const mode = this.viewMode();
    if (mode === ViewModeEnum.Day) return 1;
    if (mode === ViewModeEnum.Week) return 7;
    if (mode === ViewModeEnum.Month) return 35;

    switch (this.screenSize()) {
      case ScreenSizeEnum.Desktop: return 7;
      case ScreenSizeEnum.Tablet: return 3;
      default: return 1;
    }
  }

  private getDisplayedDays(): DisplayedDay[] {
    const current = new Date(this.currentDate());
    const daysToShow = this.getDaysToShow();
    const days: DisplayedDay[] = [];
    const isMonthView = this.viewMode() === ViewModeEnum.Month;

    const startDate = isMonthView ? new Date(current.getFullYear(), current.getMonth(), 1) : new Date(current);
    const startOffset = isMonthView ? 0 : Math.floor((daysToShow - 1) / 2);
    if (!isMonthView) {
      startDate.setDate(current.getDate() - startOffset);
    }

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayInfo = this.getHebrewDay(date.getDay());
      const dayObj = this.jewishCalendarService.createDayObject(date);

      const events = dayObj.events?.reduce(
        (acc, ev: IEventInfo) => {
          if (ev.categories.includes('holiday')) acc.holiday = ev.hebName;
          if (ev.categories.includes('parashat')) acc.parasha = ev.hebName.replace('פרשת ', '');
          if (ev.categories.includes('fast')) acc.fast = ev.hebName;
          return acc;
        },
        { holiday: '', parasha: '', fast: '' }
      ) ?? { holiday: '', parasha: '', fast: '' };

      const shabbat = (date.getDay() === 5 || date.getDay() === 6)
        ? {
            candleLighting: dayObj.zmanim.candleLighting?.time,
            havdalah: dayObj.zmanim.havdalah?.time,
          }
        : undefined;

      days.push({
        date,
        letter: dayInfo.letter,
        name: dayInfo.name,
        formatted: this.jewishCalendarService.getHebrewDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
        isCurrent: date.toDateString() === this.currentDate().toDateString(),
        holiday: events.holiday,
        parasha: events.parasha,
        fast: events.fast,
        shabbat,
        zmanim: {
          sunrise: dayObj.zmanim.sunrise?.time,
          sunset: dayObj.zmanim.sunset?.time,
          chatzot: dayObj.zmanim.chatzot?.time,
          alotHashachar: dayObj.zmanim.alotHaShachar?.time,
        },
      });
    }

    return days;
  }

  private getHebrewDay(dayIndex: number): { letter: string; name: string } {
    const day = daysNames.find(d => d.index === dayIndex);
    return { letter: day?.letter ?? '', name: day?.he ?? '' };
  }
}