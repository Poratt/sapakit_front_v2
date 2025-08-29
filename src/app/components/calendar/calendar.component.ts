import { Component, effect, inject, signal, OnDestroy, OnInit, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { RouterModule } from '@angular/router';
import { Status } from '../../common/enums/status.enum';

import { BadgeComponent } from '../shared/badge/badge.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OrderStatus, orderStatusData } from '../../common/enums/order-status.enum';
import { fadeIn400 } from '../../common/const/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import { OrderStatusPipe } from "../../pipes/orderStatus.pipe";
import { TooltipModule } from 'primeng/tooltip';
import { OrderStore } from '../../store/order.store';
import { SupplierStore } from '../../store/supplier.store';
import { OrderType } from '../../common/enums/order-type';
import { ReminderType } from '../../common/enums/reminderType';
import { OrderFlowService } from '../../services/order-flow.service';
import { Supplier } from '../../common/models/supplier';
import { Order } from '../../common/models/order';


export enum ScreenSizeEnum {
	Mobile = 'mobile',
	Tablet = 'tablet',
	Desktop = 'desktop'
}

const SCREEN_SIZE_BREAKPOINTS = {
	[ScreenSizeEnum.Mobile]: 0,
	[ScreenSizeEnum.Tablet]: 640,
	[ScreenSizeEnum.Desktop]: 1024,
};

interface DaySupplier {
	supplier: Supplier;
	orderStatus: OrderStatus;
	displayState: 'active' | 'missed';
}

interface Day {
	letter: string;
	date: number;
	fullDate: Date;
	suppliers: DaySupplier[];
	isToday: boolean;
}

interface PreviewDay {
	letter: string;
	date: number;
	fullDate: Date;
	isToday: boolean;
	isSelected: boolean;
}

@Component({
	selector: 'app-calendar',
	standalone: true,
	imports: [CommonModule, ButtonModule, DynamicDialogModule, RouterModule, BadgeComponent, ToastModule, OrderStatusPipe, TooltipModule],
	providers: [DialogService, MessageService],
	templateUrl: './calendar.component.html',
	styleUrl: './calendar.component.css',
	animations: [fadeIn400]
})
export class CalendarComponent implements OnInit, OnDestroy {
	private readonly orderStore = inject(OrderStore);
	private readonly supplierStore = inject(SupplierStore);

	private readonly orderFlowService = inject(OrderFlowService);
	private document = inject(DOCUMENT);

	public suppliers = this.supplierStore.suppliers;
	public orders = this.orderStore.orders;
	public isFetching = this.orderStore.isLoading;

	public OrderStatus = OrderStatus;
	public orderStatusData = orderStatusData;

	currentDate = signal(new Date());
	selectedPreviewDate = signal(new Date());
	allDays = signal<Map<number, Day>>(new Map());
	screenSize = signal<ScreenSizeEnum>(ScreenSizeEnum.Desktop);


	private hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
	private dayLetters = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
	private resizeObserver?: ResizeObserver;

	readonly viewPort = computed(() => {
		const center = new Date(this.currentDate()); center.setHours(0, 0, 0, 0);
		const range = this.getDaysToShow();
		let startDate: Date;

		if (this.screenSize() === ScreenSizeEnum.Desktop) {
			// For desktop view, align to the start of the week (Sunday)
			startDate = new Date(center);
			const dayOfWeek = startDate.getDay(); // 0 for Sunday
			startDate.setDate(startDate.getDate() - dayOfWeek);
		} else {
			// For mobile/tablet, keep the centered logic
			const startOffset = Math.floor((range - 1) / 2);
			startDate = new Date(center);
			startDate.setDate(center.getDate() - startOffset);
		}

		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + range - 1);
		return { startDate, endDate };
	});

	readonly displayedDays = computed(() => {
		const { startDate, endDate } = this.viewPort();
		const daysMap = this.allDays();
		const displayArray: Day[] = [];
		const tempDate = new Date(startDate);
		while (tempDate <= endDate) {
			displayArray.push(daysMap.get(tempDate.getTime()) || this.createEmptyDay(new Date(tempDate)));
			tempDate.setDate(tempDate.getDate() + 1);
		}
		return displayArray;
	});

	readonly sevenDaysPreview = computed(() => {
		const center = new Date(this.selectedPreviewDate());
		center.setHours(0, 0, 0, 0);

		// Start from 3 days before center
		const startDate = new Date(center);
		startDate.setDate(center.getDate() - 3);

		const days: PreviewDay[] = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < 7; i++) {
			const dayDate = new Date(startDate);
			dayDate.setDate(startDate.getDate() + i);

			days.push({
				letter: this.dayLetters[dayDate.getDay()],
				date: dayDate.getDate(),
				fullDate: dayDate,
				isToday: dayDate.getTime() === today.getTime(),
				isSelected: dayDate.getTime() === this.selectedPreviewDate().getTime()
			});
		}

		return days;
	});

	readonly monthDisplay = computed(() => {
		const days = this.displayedDays();
		if (days.length === 0) return '';
		const displayDate = days[Math.floor(days.length / 2)].fullDate;
		return `${this.hebrewMonths[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
	});

	constructor() {
		this.updateScreenSize();
		this.initializeDate();
		effect(() => {
			const { startDate, endDate } = this.viewPort();
			if (this.suppliers().length > 0 && startDate && endDate) {
				this.orderStore.loadOrdersByDateRange({
					supplierIds: this.suppliers().map(s => s.id),
					startDate: this.formatDate(startDate),
					endDate: this.formatDate(endDate),
				});
			}
		});
		effect(() => {
			const ordersFromStore = this.orders();
			const suppliersFromStore = this.suppliers();

			if (suppliersFromStore.length > 0) {
				this.buildCalendarDisplay(ordersFromStore, suppliersFromStore);
			}
		});
	}

	ngOnInit(): void {
		if (typeof window !== 'undefined') {
			this.resizeObserver = new ResizeObserver(() => this.updateScreenSize());
			this.resizeObserver.observe(this.document.body);
		}
	}

	ngOnDestroy(): void { this.resizeObserver?.disconnect(); }

	private initializeDate(): void {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		this.currentDate.set(today);
		this.selectedPreviewDate.set(today);
	}

	private updateScreenSize(): void {
		if (typeof window === 'undefined') return;
		const width = window.innerWidth;
		let newSize = ScreenSizeEnum.Mobile;
		if (width >= SCREEN_SIZE_BREAKPOINTS.desktop) newSize = ScreenSizeEnum.Desktop;
		else if (width >= SCREEN_SIZE_BREAKPOINTS.tablet) newSize = ScreenSizeEnum.Tablet;
		if (newSize !== this.screenSize()) this.screenSize.set(newSize);
	}

	private getDaysToShow(): number {
		switch (this.screenSize()) {
			case ScreenSizeEnum.Desktop: return 7;
			case ScreenSizeEnum.Tablet: return 3;
			default: return 1;
		}
	}


	private hasOrderInDateRange(
		supplierId: number,
		startDate: Date,
		endDate: Date,
		ordersMap: Map<string, Order>
	): boolean {
		let currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			const orderKey = `${supplierId}-${this.formatDate(currentDate)}`;
			if (ordersMap.has(orderKey)) {
				return true;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return false;
	}

	private buildCalendarDisplay(orders: Order[], allSuppliers: Supplier[]): void {
		const { startDate, endDate } = this.viewPort();
		if (!startDate || !endDate) return;

		const newDaysMap = new Map<number, Day>();
		const ordersMap = new Map<string, Order>(orders.map(o => [`${o.supplierId}-${o.date}`, o]));
		const activeSuppliers = allSuppliers.filter(s => !s.isDeleted && s.status === Status.Active);
		const todayTimestamp = new Date().setHours(0, 0, 0, 0);

		// שלב 1: צור מפה של ספקים שכבר הזמינו השבוע (רק לסוג 2)
		const suppliersWithOrderThisWeek = new Set<number>();
		for (const supplier of activeSuppliers) {
			if (supplier.reminderType === ReminderType.UntilOrderDone) {
				if (this.hasOrderInDateRange(supplier.id, startDate, endDate, ordersMap)) {
					suppliersWithOrderThisWeek.add(supplier.id);
				}
			}
		}

		// שלב 2: בנה את תצוגת הימים
		let tempDate = new Date(startDate);
		while (tempDate <= endDate) {
			const day = this.createEmptyDay(new Date(tempDate));

			day.suppliers = activeSuppliers
				.map(supplier => {
					const order = ordersMap.get(`${supplier.id}-${this.formatDate(day.fullDate)}`);
					const isScheduledDay = this.isOrderDay(supplier, day.fullDate);

					// תנאי 1: הצג תמיד אם יש הזמנה קיימת
					if (order) {
						return {
							supplier,
							orderStatus: order.status,
							displayState: 'active', // 'ordered' state is handled by the badge
						};
					}

					// תנאי 2: אם זה יום מתוזמן (ולא הזמנה קיימת)
					if (isScheduledDay) {
						const isPast = day.fullDate.getTime() < todayTimestamp;

						// עבור reminderType 2, הצג רק אם אין הזמנה קיימת בכלל השבוע
						if (supplier.reminderType === ReminderType.UntilOrderDone) {
							if (!suppliersWithOrderThisWeek.has(supplier.id)) {
								return {
									supplier,
									orderStatus: OrderStatus.Empty,
									displayState: isPast ? 'missed' : 'active',
								};
							}
						}
						// עבור reminderType 1, תמיד הצג
						else {
							return {
								supplier,
								orderStatus: OrderStatus.Empty,
								displayState: isPast ? 'missed' : 'active',
							};
						}
					}

					return null; // אם אף אחד מהתנאים לא התקיים
				})
				.filter((s): s is DaySupplier => s !== null);

			newDaysMap.set(day.fullDate.getTime(), day);
			tempDate.setDate(tempDate.getDate() + 1);
		}

		this.allDays.set(newDaysMap);
	}

	private createEmptyDay(date: Date): Day {
		const today = new Date(); today.setHours(0, 0, 0, 0);
		return {
			letter: this.dayLetters[date.getDay()], date: date.getDate(), fullDate: date,
			suppliers: [], isToday: date.getTime() === today.getTime(),
		};
	}

	onPreviewDayClick(date: Date): void {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		this.selectedPreviewDate.set(newDate);
		this.currentDate.set(newDate);
	}

	navigateByDays(offset: number) {
		const newDate = new Date(this.currentDate());
		newDate.setDate(newDate.getDate() + offset);
		this.currentDate.set(newDate);
		this.selectedPreviewDate.set(newDate); // Sync the preview date
	}

	goToToday() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		this.currentDate.set(today);
		this.selectedPreviewDate.set(today);
	}

	prevWeek(): void { this.navigateByDays(-this.getDaysToShow()); }
	nextWeek(): void { this.navigateByDays(this.getDaysToShow()); }

	isCurrentWeek(): boolean {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const currentRefDate = new Date(this.currentDate());
		currentRefDate.setHours(0, 0, 0, 0);

		if (this.screenSize() !== ScreenSizeEnum.Desktop) {
			// For mobile/tablet, the old logic is fine as it's centered on the day.
			return this.formatDate(today) === this.formatDate(currentRefDate);
		}

		// For desktop, check if today is in the same week (Sun-Sat) as the reference date.
		const todaySunday = new Date(today);
		todaySunday.setDate(today.getDate() - today.getDay());

		const currentSunday = new Date(currentRefDate);
		currentSunday.setDate(currentRefDate.getDate() - currentRefDate.getDay());

		return this.formatDate(todaySunday) === this.formatDate(currentSunday);
	}

	openOrderDialog(data: DaySupplier, date: Date): void {
		if (data.displayState === 'missed') {
			return;
		}

		const existingOrder = this.orders().find(o =>
			o.supplierId === data.supplier.id && o.date === this.formatDate(date)
		);

		this.orderFlowService.openOrderDialog({
			supplier: data.supplier,
			date: date,
			existingOrder: existingOrder
		});
	}



	private formatDate(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}


	private isOrderDay(supplier: Supplier, date: Date): boolean {
		if (supplier.orderType === OrderType.ByDay) {
			return supplier.orderDays?.includes(date.getDay()) || false;
		}
		else if (supplier.orderType === OrderType.ByDate) {
			return supplier.orderDates?.includes(date.getDate()) || false;
		}
		return false;
	}


	logDay(day: any) {
		console.log(this.suppliers());
		console.log(day);
	}

}