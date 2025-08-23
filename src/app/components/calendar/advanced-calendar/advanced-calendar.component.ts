import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { SupplierStore } from '../../../store/supplier.store';
import { OrderStore } from '../../../store/order.store';

import { OrderStatus, orderStatusData } from '../../../common/enums/order-status.enum';
import { Status } from '../../../common/enums/status.enum';
import { ReminderType } from '../../../common/enums/reminderType';
import { OrderType } from '../../../common/enums/order-type';
import { OrderFlowService } from '../../../services/order-flow.service';
import { IEventInfo, JewishCalendarService } from '../../../services/jewish-calendar.service';
import { AuthStore } from '../../../store/auth.store';
import { UserRole } from '../../../common/enums/userRole.enum';
import { TextSplitPipe } from "../../../pipes/split.pipe";
import { HasHolidayPipe, FindHolidayPipe } from "../../../pipes/has-holiday.pipe";
import { Order } from '../../../common/models/order';
import { Supplier } from '../../../common/models/supplier';


export type EventDisplayState = 'future' | 'today' | 'empty' | 'sent' | 'draft';


export interface CalendarEvent {
  id: string;
  supplier: Supplier;
  startDate: Date;
  endDate: Date;
  durationInDays: number;
  status: OrderStatus | null; // <-- יכול להיות NULL
  displayState: EventDisplayState;
  row: number;
}

export interface DayDisplay {
  letter: string;
  date: number;
  fullDate: Date;
  isToday: boolean;

  formatted?: string;
  holiday?: string;
  parasha?: string;
  fast?: string;
  shabbat?: { candleLighting?: string; havdalah?: string };
  zmanim: { sunrise?: string; sunset?: string; chatzot?: string; alotHashachar?: string };
}

@Component({
  selector: 'app-advanced-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule, DynamicDialogModule, TextSplitPipe, HasHolidayPipe, FindHolidayPipe],
  providers: [DialogService, MessageService],
  templateUrl: './advanced-calendar.component.html',
  styleUrl: './advanced-calendar.component.css'
})
export class AdvancedCalendarComponent {
  private readonly supplierStore = inject(SupplierStore);
  private readonly orderStore = inject(OrderStore);
  private readonly orderFlowService = inject(OrderFlowService);
  private jewishCalendarService = inject(JewishCalendarService);
  public currentDate = signal(new Date());
  public calendarEvents = signal<CalendarEvent[]>([]);
  private authStore = inject(AuthStore);

  public readonly todayTimestamp = new Date().setHours(0, 0, 0, 0);

  private readonly hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  private readonly dayLetters = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  public OrderStatus = OrderStatus
  public readonly orderStatusData = orderStatusData;


  // Accessing the store's signals
  readonly userRole = this.authStore.userRole;



  public readonly viewPort = computed(() => {
    const center = new Date(this.currentDate());
    center.setHours(0, 0, 0, 0);
    const startDate = new Date(center);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
  });



  public readonly displayedDays = computed<DayDisplay[]>(() => {
    const { startDate } = this.viewPort();
    const days: DayDisplay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayObj = this.jewishCalendarService.createDayObject(currentDate);

      const events = dayObj.events?.reduce(
        (acc, ev: IEventInfo) => {
          if (ev.categories.includes('holiday')) acc.holiday = ev.hebName;
          if (ev.categories.includes('parashat')) acc.parasha = ev.hebName.replace('פרשת ', '');
          if (ev.categories.includes('fast')) acc.fast = ev.hebName;
          return acc;
        },
        { holiday: '', parasha: '', fast: '' }
      ) ?? { holiday: '', parasha: '', fast: '' };

      const shabbat = (currentDate.getDay() === 5 || currentDate.getDay() === 6)
        ? {
          candleLighting: dayObj.zmanim.candleLighting?.time,
          havdalah: dayObj.zmanim.havdalah?.time,
        }
        : undefined;

      days.push({
        letter: this.dayLetters[currentDate.getDay()],
        date: currentDate.getDate(),
        fullDate: currentDate,
        isToday: currentDate.getTime() === today.getTime(),
        formatted: this.jewishCalendarService.getHebrewDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()),
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
  });
  public readonly monthDisplay = computed(() => {
    const displayDate = this.viewPort().startDate;
    const year = displayDate.getFullYear();
    const month = this.hebrewMonths[displayDate.getMonth()];
    const endDate = new Date(displayDate);
    endDate.setDate(displayDate.getDate() + 6);
    if (displayDate.getMonth() !== endDate.getMonth()) {
      const endMonth = this.hebrewMonths[endDate.getMonth()];
      return `${month} - ${endMonth} ${year}`;
    }
    return `${month} ${year}`;
  });

  public readonly gridTemplateRowsStyle = computed(() => {
    const events = this.calendarEvents();
    if (events.length === 0) return 'auto';
    const maxRow = Math.max(0, ...events.map(e => e.row));
    return `auto repeat(${maxRow > 0 ? maxRow : 1}, 38px)`;
  });

  constructor() {
    this.currentDate.set(this.getStartOfWeek(new Date()));
    effect(() => {
      const { startDate, endDate } = this.viewPort();
      const suppliers = this.supplierStore.suppliers();
      if (suppliers.length > 0) {
        this.orderStore.loadOrdersByDateRange({
          supplierIds: suppliers.map(s => s.id),
          startDate: this.formatDate(startDate),
          endDate: this.formatDate(endDate),
        });
      }
    });
    effect(() => {
      const orders = this.orderStore.orders();
      const suppliers = this.supplierStore.suppliers();
      this.buildCalendarEvents(orders, suppliers);
    });
  }


  private buildCalendarEvents(orders: Order[], allSuppliers: Supplier[]): void {
    const { startDate, endDate } = this.viewPort();
    if (!allSuppliers || allSuppliers.length === 0) {
      this.calendarEvents.set([]);
      return;
    }

    const ordersMap = new Map<string, Order>(orders.map(o => [`${o.supplierId}-${o.date}`, o]));
    const activeSuppliers = allSuppliers.filter(s => !s.isDeleted && s.status === Status.Active);
    const finalEvents: CalendarEvent[] = [];
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    for (const supplier of activeSuppliers) {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = this.formatDate(currentDate);
        const orderOnDate = ordersMap.get(`${supplier.id}-${dateStr}`);
        const isScheduledDay = this.isOrderDay(supplier, currentDate);

        if (orderOnDate) {
          const displayState = orderOnDate.status === OrderStatus.Draft ? 'draft' : 'sent';
          finalEvents.push(this.createEvent(supplier, currentDate, currentDate, orderOnDate.status, displayState));

        } else if (isScheduledDay) {
          const currentTimestamp = currentDate.getTime();

          // --- לוגיקה חדשה לקביעת הסטטוס: empty, today, future ---
          let displayState: 'empty' | 'today' | 'future';
          if (currentTimestamp < todayTimestamp) {
            displayState = 'empty';
          } else if (currentTimestamp === todayTimestamp) {
            displayState = 'today';
          } else {
            displayState = 'future';
          }

          if (supplier.reminderType === ReminderType.UntilOrderDone) {
            const hasOrderInWeek = this.hasOrderInDateRange(supplier.id, startDate, endDate, ordersMap);

            if (!hasOrderInWeek) {
              const sequence = this.findFullSequence(supplier, startDate, endDate);
              if (sequence && sequence.start.getTime() === currentDate.getTime()) {
                // קבע את הסטטוס על בסיס הרצף כולו
                const sequenceDisplayState = sequence.isPast ? 'empty' : this.getSequenceState(sequence, todayTimestamp);
                finalEvents.push(this.createEvent(supplier, sequence.start, sequence.end, OrderStatus.Empty, sequenceDisplayState));
                currentDate = new Date(sequence.end);
              }
            }
          } else { // ReminderType.EachTime
            finalEvents.push(this.createEvent(supplier, currentDate, currentDate, OrderStatus.Empty, displayState));
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    this.calendarEvents.set(this.layoutEventsWithRows(finalEvents));
  }

  // in advanced-calendar.component.ts

  private getSequenceState(sequence: { start: Date, end: Date }, todayTimestamp: number): 'today' | 'future' {
    const startTimestamp = sequence.start.getTime();
    const endTimestamp = sequence.end.getTime();

    // בדוק אם היום נמצא בין ההתחלה לסוף (כולל)
    if (todayTimestamp >= startTimestamp && todayTimestamp <= endTimestamp) {
      return 'today';
    }

    // אם לא, הרצף חייב להיות כולו בעתיד
    return 'future';
  }


  private findFullSequence(supplier: Supplier, weekStart: Date, weekEnd: Date): { start: Date, end: Date, isPast: boolean } | null {
    let firstDay: Date | null = null;
    let lastDay: Date | null = null;
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    let currentDate = new Date(weekStart);
    while (currentDate <= weekEnd) {
      if (this.isOrderDay(supplier, currentDate)) {
        if (!firstDay) {
          firstDay = new Date(currentDate);
        }
        lastDay = new Date(currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (firstDay && lastDay) {
      // רצף נחשב "בעבר" אם כל כולו (כולל היום האחרון שלו) נמצא לפני היום
      const isPast = lastDay.getTime() < todayTimestamp;
      return { start: firstDay, end: lastDay, isPast: isPast };
    }

    return null;
  }

  private hasOrderInDateRange(supplierId: number, startDate: Date, endDate: Date, ordersMap: Map<string, Order>): boolean {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (ordersMap.has(`${supplierId}-${this.formatDate(currentDate)}`)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  }

  private createEvent(supplier: Supplier, startDate: Date, endDate: Date, status: OrderStatus, displayState: CalendarEvent['displayState']): CalendarEvent {
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const uniqueId = `${supplier.id}-${startDate.getTime()}-${displayState}`;
    return { id: uniqueId, supplier, startDate: new Date(startDate), endDate: new Date(endDate), durationInDays: duration, status, displayState, row: 1 };
  }

  private layoutEventsWithRows(events: CalendarEvent[]): CalendarEvent[] {
    // 1. קבץ את כל האירועים לפי מזהה הספק
    const eventsBySupplier = new Map<number, CalendarEvent[]>();
    for (const event of events) {
        if (!eventsBySupplier.has(event.supplier.id)) {
            eventsBySupplier.set(event.supplier.id, []);
        }
        eventsBySupplier.get(event.supplier.id)!.push(event);
    }

    // 2. הפוך את המפה למערך וסדר את הספקים (למשל, לפי שם)
    const sortedSuppliersEvents = Array.from(eventsBySupplier.values())
        .sort((a, b) => a[0].supplier.name.localeCompare(b[0].supplier.name));

    // 3. הקצה לכל ספק שורה קבועה ועדכן את כל האירועים שלו
    const finalEvents: CalendarEvent[] = [];
    sortedSuppliersEvents.forEach((supplierEvents, index) => {
        const rowNumber = index + 1; // השורה מתחילה מ-1
        for (const event of supplierEvents) {
            event.row = rowNumber;
            finalEvents.push(event);
        }
    });

    return finalEvents;
}


  private isOrderDay(supplier: Supplier, date: Date): boolean {
    if (supplier.orderType === OrderType.ByDay) return supplier.orderDays?.includes(date.getDay()) ?? false;
    if (supplier.orderType === OrderType.ByDate) return supplier.orderDates?.includes(date.getDate()) ?? false;
    return false;
  }

  private getStartOfWeek(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    newDate.setDate(newDate.getDate() - newDate.getDay());
    return newDate;
  }

  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // --- UI Actions ---
  public prevWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate.set(newDate);
  }

  public nextWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate.set(newDate);
  }

  public goToToday(): void {
    this.currentDate.set(this.getStartOfWeek(new Date()));
  }

  // in advanced-calendar.component.ts

  public openOrderDialog(event: CalendarEvent): void {
    console.log(this.userRole());
    
    if (event.displayState === 'empty' && this.userRole() === UserRole.User) {
      // this.notificationService.toast({
      //   severity: 'info', // שיניתי ל-info כי זו לא שגיאה, אלא הגבלת הרשאה
      //   summary: 'הרשאה נדרשת',
      //   detail: 'רק מנהלים יכולים לפתוח הזמנות עבר.',
      //   life: 3000
      // });
      return; // אם כן, צא מהפונקציה
    }

    const eventDate = new Date(event.startDate);
    eventDate.setHours(0, 0, 0, 0);

    const existingOrder = this.orderStore.orders().find(o =>
      o.supplierId === event.supplier.id && o.date === this.formatDate(eventDate)
    );

    const dateForDialog = event.displayState === 'today' ? new Date() : eventDate;
    dateForDialog.setHours(0, 0, 0, 0);

    this.orderFlowService.openOrderDialog({
      supplier: event.supplier,
      date: dateForDialog,
      existingOrder: existingOrder
    });
  }

  public isCurrentWeek(): boolean {
    const today = new Date();
    const currentViewDate = this.currentDate(); // השתמש בסיגנל ישירות

    // מצא את יום ראשון של השבוע הנוכחי
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    // מצא את יום ראשון של השבוע המוצג בתצוגה
    const startOfDisplayedWeek = new Date(currentViewDate);
    startOfDisplayedWeek.setDate(currentViewDate.getDate() - currentViewDate.getDay());
    startOfDisplayedWeek.setHours(0, 0, 0, 0);

    // השווה את ה-timestamps של שני ימי הראשון
    return startOfCurrentWeek.getTime() === startOfDisplayedWeek.getTime();
  }


  showHebrewCal = signal<boolean>(false)
  public toggleHebrewCal() {
    this.showHebrewCal.update(value => value = !value)
  }



}