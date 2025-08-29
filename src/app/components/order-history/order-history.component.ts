import { Component, Input, signal, effect, inject, AfterViewInit, OnInit, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { fadeIn400 } from '../../common/const/animations';
import { HebrewDayPipe } from '../../pipes/hebrewDay.pipe';
import { MessageModule } from 'primeng/message';
import { formatDateToYYYYMMDD } from '../../common/utils/date.utils';
import { BaseChartAnimation, ChartDefaultSettings, LightChartColors, TooltipChart } from '../../common/const/chart-config';
import { SupplierStore } from '../../store/supplier.store';
import { MatTabsModule } from '@angular/material/tabs';
import { Category } from '../../common/models/category';
import { Order } from '../../common/models/order';
import { PageStates } from '../../common/models/pageStates';
import { Product } from '../../common/models/product';
import { AuthStore } from '../../store/auth.store';

// Interfaces
interface ProductSummary {
	productId?: number;
	categoryId?: number;
	categoryName?: string;
	name: string;
	cost?: number;
	price?: number;
	values: { [date: string]: number }; // Holds quantities or costs
}
interface DateDisplay {
	date: string; // YYYY-MM-DD
	formatted: string;
	hebrewDay: string;
	isToday: boolean;
	weekNumber: number;
	isPastOrToday: boolean;
}
type ChartType = 'line' | 'bar' | 'doughnut';
type ChartMetric = 'quantity' | 'cost' | 'price';

@Component({
	selector: 'app-order-history',
	standalone: true,
	providers: [HebrewDayPipe],
	templateUrl: './order-history.component.html',
	styleUrls: ['./order-history.component.css'],
	animations: [fadeIn400],
	imports: [
		CommonModule, FormsModule, TableModule, SelectModule, ButtonModule, SelectButtonModule,
		TooltipModule, LoaderComponent, ChartModule, MessageModule, MatTabsModule
	],
})
export class OrderHistoryComponent implements OnInit, AfterViewInit {
	private hebrewDayPipe = inject(HebrewDayPipe);
	private apiService = inject(ApiService);
	private notificationService = inject(NotificationService);

	private readonly supplierStore = inject(SupplierStore);
	private readonly authStore = inject(AuthStore);

	PageStates = signal(PageStates);
	pageState = signal(PageStates.Loading);
	isFetching = signal<boolean>(false);
	isViewInitialized = signal(false);
	readonly isAdmin = this.authStore.isAdmin;


	@Input() supplierId = signal<number | null>(null);
	viewMode = signal<'weekly' | 'monthly'>('monthly');
	viewModeOptions = [
		{ label: 'שבועי', value: 'weekly', icon: 'date_range' },
		{ label: 'חודשי', value: 'monthly', icon: 'calendar_month' },
	];
	viewProps = signal<'product' | 'category'>('product');
	viewPropsOptions = [
		{ label: 'מוצר', value: 'product', icon: 'package_2' },
		{ label: 'קטגוריה', value: 'category', icon: 'storefront' },
	];
	splitChartByProp = signal<boolean>(false);
	splitChartOptions = computed(() => {
		const currentViewPropsLabel = this.viewPropsOptions.find(el => el.value === this.viewProps())?.label || 'פריט';
		return [
			{ label: 'תצוגה כללית', value: false, icon: 'bar_chart' },
			{ label: `פיצול לפי ${currentViewPropsLabel}`, value: true, icon: 'donut_small' }
		];
	});
	selectedChartType = signal<ChartType>('line');
	chartTypeOptions = [
		{ label: 'קו', value: 'line', icon: 'show_chart' },
		{ label: 'עמודות', value: 'bar', icon: 'bar_chart' },
		{ label: 'עוגה', value: 'doughnut', icon: 'pie_chart' },
	];
	selectedChartMetric = signal<ChartMetric>('quantity');
	chartMetricOptions = [
		{ label: 'כמויות', value: 'quantity', icon: 'box', xAxis: 'תאריך', yAxis: 'כמות' },
		{ label: 'מחיר עלות', value: 'cost', icon: 'money_bag', xAxis: 'תאריך', yAxis: 'עלות (₪)' },
		{ label: 'מחיר מכירה', value: 'price', icon: 'point_of_sale', xAxis: 'תאריך', yAxis: 'עלות (₪)' },
	];
	selectedTab = signal<'table' | 'chart'>('table');
	tabOptions = [
		{ label: 'תצוגת טבלה', value: 'table', icon: 'table' },
		{ label: 'תצוגת גרף', value: 'chart', icon: 'bar_chart' },
	];


	startDate = signal<string>('');
	endDate = signal<string>('');
	public suppliers = this.supplierStore.suppliers;
	categories = signal<Category[]>([]);
	products = signal<ProductSummary[]>([]);
	private rawOrders = signal<Order[]>([]);
	dates = signal<DateDisplay[]>([]);
	supplierProducts = signal<Product[]>([]);

	chartData = signal<any>(null);
	chartOptions = signal<any>(null);
	private baseChartOptionsInternal: any = null;
	lastFetchedRange = signal<{ startDate: string; endDate: string } | null>(null);
	lastFetchedSupplierId = signal<number | null>(null);
	private fetchTimeout: ReturnType<typeof setTimeout> | null = null;


	windowHeight = signal(window.innerHeight);
	scrollHeight = computed(() => String(this.windowHeight() - 80 - 12 - 12 - 34 - 136 ) + 'px' );


	constructor() {

		window.addEventListener('resize', () => {
			this.windowHeight.set(window.innerHeight);
		});
		// Effect 1: Update date range when viewMode changes.
		effect(() => {
			this.viewMode();
			console.log(`EFFECT 1 (viewMode): View mode changed to -> ${this.viewMode()}`);
			this.setInitialDateRange();
		});

		// Effect 2: Schedule API fetch ONLY when supplier or date range change.
		effect(() => {
			const currentSupplierIdVal = this.supplierId();
			const currentStartDateVal = this.startDate();
			const currentEndDateVal = this.endDate();
			if (currentSupplierIdVal && currentStartDateVal && currentEndDateVal) {
				const lastRangeVal = this.lastFetchedRange();
				const lastSupplierVal = this.lastFetchedSupplierId();
				if (!this.isFetching() &&
					(!lastRangeVal || !lastSupplierVal ||
						lastRangeVal.startDate !== currentStartDateVal ||
						lastRangeVal.endDate !== currentEndDateVal ||
						lastSupplierVal !== currentSupplierIdVal)) {
					this.scheduleFetchOrders();
				}
			} else {
				this.rawOrders.set([]);
			}
		});

		effect(() => {
			const supplierId = this.supplierId();
			console.log(`EFFECT 2 (supplierProducts): Supplier ID is now -> ${supplierId}`);
			if (supplierId) {
				this.loadSupplierProducts(supplierId);
			} else {
				console.log('EFFECT 2: Resetting supplier products because no supplier is selected.');
				this.supplierProducts.set([]);
			}
		});

		// Effect 3: Re-process data when raw data, view type, or metric changes.
		effect(() => {
			const orders = this.rawOrders();
			this.viewProps();
			this.selectedChartMetric();
			this.processOrderDetails(orders);
		})

		// Effect 4: Update chart display when processed data or chart settings change.
		effect(() => {
			this.products();
			this.dates();
			this.selectedChartType();
			this.selectedChartMetric();
			this.splitChartByProp();
			if (this.isViewInitialized()) {
				this.updateChartData();
			}
		});

		// Effect 5: Update chart options (titles, scales) when chart type or metric changes.
		effect(() => {
			const type = this.selectedChartType();
			const metric = this.selectedChartMetric();
			if (this.baseChartOptionsInternal && this.isViewInitialized()) {
				this.updateDynamicChartOptions(type, metric);
			}
		});

		// Effect 6: Handle incompatible chart states.
		effect(() => {
			const isSplitView = this.splitChartByProp();
			const currentType = this.selectedChartType();

			// אם עברנו לפיצול ויש דונאטס - החלף אוטומטית לעמודות
			if (isSplitView && currentType === 'doughnut') {
				console.log('Auto-switching from doughnut to bar chart due to split view');
				this.selectedChartType.set('bar');

				// הצג הודעה ידידותית למשתמש
				this.notificationService.toast({
					severity: 'info',
					summary: 'הגרף שונה',
					detail: 'עבר לגרף עמודות - עוגת דונאטס זמינה רק בתצוגה כללית',
					life: 4000
				});
			}
		});

		effect(() => {
			const suppliersFromStore = this.supplierStore.suppliers();
			const isLoading = this.supplierStore.isLoading();
			const error = this.supplierStore.error();
			console.log(`EFFECT 7 (pageState): Triggered. isLoading: ${isLoading}, Suppliers: ${suppliersFromStore.length}, Error: ${error}`);

			if (isLoading) {
				this.pageState.set(PageStates.Loading);
				return;
			}
			if (error) {
				this.pageState.set(PageStates.Error);
				return;
			}
			if (suppliersFromStore.length > 0) {
				if (!this.supplierId() || !suppliersFromStore.some(s => s.id === this.supplierId())) {
					console.log('EFFECT 7: No supplier selected, setting the first one.');
					this.supplierId.set(suppliersFromStore[0].id);
				}
				this.pageState.set(PageStates.Ready);
			} else if (!isLoading) {
				this.pageState.set(PageStates.Empty);
			}
		});

		// אפקט חדש שיקרא לטעינת הזמנות
		effect(() => {
			const supplierId = this.supplierId();
			const startDate = this.startDate();
			const endDate = this.endDate();
			const productsLoaded = this.supplierProducts().length > 0;
			console.log(`EFFECT 8 (fetchOrders): Triggered. SupplierID: ${supplierId}, Start: ${startDate}, End: ${endDate}, Products Loaded: ${productsLoaded}`);

			// טען הזמנות רק אם יש ספק, טווח תאריכים, והכי חשוב - אחרי שמוצרי הספק נטענו!
			if (supplierId && startDate && endDate && productsLoaded) {
				this.scheduleFetchOrders();
			}
		});
	}

	// בתוך order-history.component.ts

	// הוסף computed property לזיהוי מצבים לא תקינים
	chartTypeOptionsComputed = computed(() => {
		const isSplitView = this.splitChartByProp();

		return this.chartTypeOptions.map(option => ({
			...option,
			disabled: option.value === 'doughnut' && isSplitView,
			tooltip: option.value === 'doughnut' && isSplitView
				? 'עוגת דונאטס זמינה רק בתצוגה כללית'
				: undefined
		}));
	});

	// הוסף computed property לבדיקת תקינות הבחירה הנוכחית
	isCurrentSelectionValid = computed(() => {
		const currentType = this.selectedChartType();
		const isSplitView = this.splitChartByProp();

		return !(currentType === 'doughnut' && isSplitView);
	});

	// הוסף את הפונקציה הזו בתוך OrderHistoryComponent

	onChartTypeChange(newType: ChartType): void {
		const isSplitView = this.splitChartByProp();

		// בדוק אם הבחירה תקינה
		if (newType === 'doughnut' && isSplitView) {
			// הצג הודעת שגיאה ולא תאפשר את השינוי
			this.notificationService.toast({
				severity: 'warn',
				summary: 'בחירה לא זמינה',
				detail: 'עוגת דונאטס זמינה רק בתצוגה כללית. החלף תחילה לתצוגה כללית.',
				life: 4000
			});
			return; // לא מבצע את השינוי
		}

		// אם הבחירה תקינה - בצע את השינוי
		this.selectedChartType.set(newType);

		// אם עברנו לדונאטס - אוטומטית עבור לתצוגה כללית אם צריך
		if (newType === 'doughnut' && isSplitView) {
			this.splitChartByProp.set(false);
			this.notificationService.toast({
				severity: 'info',
				summary: 'התצוגה שונתה',
				detail: 'עבר לתצוגה כללית עבור עוגת הדונאטס',
				life: 3000
			});
		}
	}

	ngOnInit() {
		console.log('ngOnInit: Initializing component');
		this.baseChartOptionsInternal = this.getBaseChartOptions();
		if (this.supplierStore.suppliers().length === 0) {
			console.log('ngOnInit: No suppliers in store, dispatching loadSuppliers.');
			this.supplierStore.loadSuppliers({});
		}
	}

	private loadSupplierProducts(supplierId: number): void {
		console.log(`API_CALL: Fetching products for supplier ${supplierId}`);
		this.apiService.getProductsBySupplier(supplierId).subscribe({
			next: (response) => {
				if (response.success && response.result) {
					console.log(`API_SUCCESS: Received ${response.result.length} products for supplier ${supplierId}`);
					this.supplierProducts.set(response.result);
				} else {
					console.warn(`API_FAIL: Failed to get products for supplier ${supplierId}. Message: ${response.message}`);
					this.supplierProducts.set([]);
				}
			},
			error: (err) => {
				console.error(`API_ERROR: Error fetching products for supplier ${supplierId}`, err);
				this.supplierProducts.set([]);
			}
		});
	}


	ngAfterViewInit() {
		this.isViewInitialized.set(true);
		this.updateDynamicChartOptions(this.selectedChartType());
		this.updateChartData();
	}


	public refreshData(): void {
		this.supplierStore.loadSuppliers({ force: true });
		this.fetchOrders();
	}



	setInitialDateRange() {
		// השתמש ב-startDate הקיים כבסיס, או ב"היום" אם הוא ריק (בטעינה ראשונה)
		const baseDate = this.startDate() ? new Date(this.startDate()) : new Date();
		baseDate.setHours(0, 0, 0, 0);

		let start: Date, end: Date;

		if (this.viewMode() === 'weekly') {
			// מצא את יום ראשון של השבוע שמכיל את ה-baseDate
			start = new Date(baseDate);
			start.setDate(baseDate.getDate() - baseDate.getDay());
			end = new Date(start);
			end.setDate(start.getDate() + 6);
		} else { // 'monthly'
			// מצא את תחילת וסוף החודש שמכיל את ה-baseDate
			start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
			end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
		}

		this.startDate.set(formatDateToYYYYMMDD(start));
		this.endDate.set(formatDateToYYYYMMDD(end));
	}

	formatDate(date: Date): string { return formatDateToYYYYMMDD(date); }

	formatDisplayDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
	}

	scheduleFetchOrders() {
		if (this.fetchTimeout) clearTimeout(this.fetchTimeout);
		this.fetchTimeout = setTimeout(() => this.fetchOrders(), 300);
	}

	fetchOrders() {
		const currentSupplierIdVal = this.supplierId();
		if (!currentSupplierIdVal || this.isFetching()) return;
		this.isFetching.set(true);
		const currentStartDateVal = this.startDate();
		const currentEndDateVal = this.endDate();
		this.apiService.findOrdersBySuppliersAndDateRange({
			supplierIds: [currentSupplierIdVal],
			startDate: currentStartDateVal,
			endDate: currentEndDateVal,
		}).subscribe({
			next: (response) => {
				if (response.success && response.result) { this.rawOrders.set(response.result); }
				else { this.rawOrders.set([]); }
			},
			error: () => {
				this.rawOrders.set([]);
				this.notificationService.toast({ severity: 'error', detail: 'שגיאה בטעינת היסטוריית הזמנות.' });
			},
			complete: () => { this.finishFetch(currentSupplierIdVal, currentStartDateVal, currentEndDateVal); },
		});
	}

	private processOrderDetails(orders: Order[]) {
		if (!orders) {
			this.products.set([]);
			return;
		}

		const viewProps = this.viewProps();
		const chartMetric = this.selectedChartMetric();
		const productMap = new Map<number, Product>(this.supplierProducts().map(p => [p.id, p]));
		console.log('Processing orders for view:', viewProps, 'with metric:', chartMetric);
		console.log('Product map:', productMap);


		if (viewProps === 'product') {
			const productSummaryMap: { [productId: number]: ProductSummary } = {};
			orders.forEach(order => {
				if (order.status === OrderStatus.Sent && order.orderProducts) {
					order.orderProducts.forEach(product => {
						if (!productSummaryMap[product.productId]) {
							productSummaryMap[product.productId] = {
								productId: product.productId, name: product.name, cost: product.cost, values: {},
								categoryName: productMap.get(product.productId)?.categoryName || 'ללא קטגוריה',
							};
						}
						let value: number;
						if (chartMetric === 'cost') {
							value = product.quantity * (product.cost || 0);
						} else if (chartMetric === 'price') {
							value = product.quantity * (product.price || 0);
						} else { // quantity
							value = product.quantity;
						}
						productSummaryMap[product.productId].values[order.date] = (productSummaryMap[product.productId].values[order.date] || 0) + value;
					});
				}
			});
			this.products.set(Object.values(productSummaryMap));
		}
		else {
			// Category View
			const categoryMap: { [categoryId: number]: ProductSummary } = {};
			orders.forEach(order => {
				if (order.status === OrderStatus.Sent && order.orderProducts) {
					order.orderProducts.forEach(product => {
						const supplierProduct = productMap.get(product.productId);
						const categoryId = supplierProduct?.categoryId || 0;
						const categoryName = supplierProduct?.categoryName || 'ללא קטגוריה';
						if (!categoryMap[categoryId]) {
							categoryMap[categoryId] = { categoryId, name: categoryName, values: {} };
						}
						let value: number;
						if (chartMetric === 'cost') {
							value = product.quantity * (product.cost || 0);
						} else if (chartMetric === 'price') {
							value = product.quantity * (product.price || 0);
						} else { // quantity
							value = product.quantity;
						}
						categoryMap[categoryId].values[order.date] = (categoryMap[categoryId].values[order.date] || 0) + value;
					});
				}
			});
			this.products.set(Object.values(categoryMap));
		}
		// After processing, update the date display
		this.updateDateDisplay(this.startDate(), this.endDate());
	}

	private finishFetch(supplierId: number, startDate: string, endDate: string) {
		this.lastFetchedRange.set({ startDate, endDate });
		this.lastFetchedSupplierId.set(supplierId);
		this.isFetching.set(false);
	}

	private getBaseChartOptions(): any {
		const documentStyle = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
		const textColor = documentStyle?.getPropertyValue('--text-color') || '#495057';
		const textColorSecondary = documentStyle?.getPropertyValue('--text-color-secondary') || '#6c757d';
		const surfaceBorder = documentStyle?.getPropertyValue('--surface-border') || '#dfe7ef';
		console.log(this.selectedChartMetric());

		return {
			...ChartDefaultSettings, animation: { ...BaseChartAnimation },
			plugins: {
				legend: {
					display: true, position: 'top', rtl: true, align: 'start', labels: {
						boxWidth: 4,
						boxHeight: 4,
						padding: 16,
						usePointStyle: true
					},
				},
				title: { display: true, text: 'היסטורית הזמנות', color: textColor, padding: { top: 10, bottom: 10 }, font: { size: 16, weight: '600' } },
				tooltip: { ...TooltipChart },
			},
			scales: {
				x: {
					stacked: true, reverse: true, offset: true, grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColorSecondary, font: { size: 12 }, padding: 10 },
					title: { display: true, text: 'תאריך', color: textColor, font: { size: 14, weight: '500' }, padding: { top: 12 } },
				},
				y: {
					stacked: true, beginAtZero: true, grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColorSecondary, precision: 0, font: { size: 12 }, padding: 10 },
					title: { display: true, text: 'כמות', color: textColor, font: { size: 14, weight: '500' }, padding: { bottom: 12 } },
				},
			},
		};
	}

	private updateDynamicChartOptions(type: ChartType, chartMetric: ChartMetric = this.selectedChartMetric()) {
		if (!this.baseChartOptionsInternal) return;
		const newOptions = JSON.parse(JSON.stringify(this.baseChartOptionsInternal)); // Deep copy
		const currentMetricOption = this.chartMetricOptions.find(option => option.value === chartMetric);
		const yAxisTitle = currentMetricOption?.yAxis || 'ערך';

		const titleMap: Record<ChartType, string> = {
			line: 'היסטורית הזמנות', bar: 'היסטורית הזמנות',
			doughnut: 'התפלגות כוללת',
		};
		newOptions.plugins.title.text = titleMap[type] || 'היסטורית הזמנות';

		// תיקון ה-tooltip callback
		newOptions.plugins.tooltip = {
			...TooltipChart,
			callbacks: {
				label: (context: any) => {
					// וודא שהלייבל הוא מחרוזת
					const label = String(context.dataset.label || '');
					const rawValue = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
					// וודא שהערך הוא מספר תקין
					const value = typeof rawValue === 'number' && !isNaN(rawValue) ? rawValue : 0;
					const metric = this.selectedChartMetric();
					const formattedValue = (metric === 'cost' || metric === 'price') ? `${value.toFixed(2)} ₪` : value.toString();
					return `${label}: ${formattedValue}`;
				},
				title: (context: any) => {
					// וודא שגם הכותרת היא מחרוזת
					if (context && context.length > 0) {
						return String(context[0].label || '');
					}
					return '';
				}
			},
		}

		if (newOptions.scales) {
			newOptions.scales.y.title.text = yAxisTitle;
			newOptions.scales.x.stacked = type === 'bar' && this.splitChartByProp();
			newOptions.scales.y.stacked = type === 'bar' && this.splitChartByProp();
		}

		if (type === 'doughnut') {
			newOptions.scales = undefined; // No axes for doughnut chart
			newOptions.plugins.legend.position = 'right';
			newOptions.plugins.tooltip.mode = 'point';
		} else {
			newOptions.plugins.legend.position = 'top';
			newOptions.plugins.tooltip.mode = 'index';
		}
		this.chartOptions.set(newOptions);
	}
	private updateChartData() {
		const currentProducts = this.products();
		const currentDates = this.dates();
		const type = this.selectedChartType();
		if (currentProducts.length === 0 || currentDates.length === 0) {
			this.chartData.set(null);
			return;
		}

		const labels = currentDates.map(date => `${this.formatDisplayDate(date.date).slice(0, 5)} (${date.hebrewDay})`);
		let newChartData;

		if (type === 'doughnut') {
			const doughnutLabels = currentProducts.map(p => p.name);
			const doughnutData = currentProducts.map(p => Object.values(p.values).reduce((sum, val) => sum + val, 0));
			const backgroundColors = currentProducts.map((_, i) => LightChartColors[i % LightChartColors.length]);
			newChartData = {
				labels: doughnutLabels,
				datasets: [{ data: doughnutData, backgroundColor: backgroundColors }],
			};
		} else if (this.splitChartByProp()) {
			newChartData = {
				labels,
				datasets: currentProducts.map((product, index) => ({
					label: product.name,
					data: currentDates.map(date => product.values[date.date] || 0),
					borderColor: LightChartColors[index % LightChartColors.length],
					backgroundColor: LightChartColors[index % LightChartColors.length],
					fill: false,
					tension: 0.4,
					borderWidth: 2,
					pointRadius: 2,
				})),
			};
		} else {
			const totalValues = currentDates.map(date =>
				currentProducts.reduce((sum, product) => sum + (product.values[date.date] || 0), 0)
			);
			newChartData = {
				labels,
				datasets: [{
					label: 'סה"כ',
					data: totalValues,
					borderColor: LightChartColors[0],
					backgroundColor: LightChartColors[0],
					fill: false,
					tension: 0.4,
					borderWidth: 2,
				}],
			};
		}
		this.chartData.set(newChartData);
	}

	private updateDateDisplay(startDateStr: string, endDateStr: string) {
		const datesArray: DateDisplay[] = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayTime = today.getTime();
		let current = new Date(startDateStr);
		const end = new Date(endDateStr);

		const orderDates = new Set(this.rawOrders().map(order => order.date));

		while (current <= end) {
			const dateStr = this.formatDate(current);
			if (orderDates.has(dateStr)) {
				const firstDayOfYear = new Date(current.getFullYear(), 0, 1);
				const pastDaysOfYear = (current.getTime() - firstDayOfYear.getTime()) / 86400000;
				const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
				datesArray.push({
					date: dateStr,
					formatted: dateStr,
					hebrewDay: this.hebrewDayPipe.transform(current.getDay()),
					isToday: current.getTime() === todayTime,
					weekNumber: weekNumber,
					isPastOrToday: current.getTime() <= todayTime,
				});
			}
			current.setDate(current.getDate() + 1);
		}
		this.dates.set(datesArray.sort((a, b) => a.date.localeCompare(b.date)));
	}

	getTableCellValue(product: ProductSummary, date: DateDisplay): string | number {
		const value = product.values[date.date] || 0;
		if (value === 0) {
			return date.isPastOrToday ? '-' : '';
		}
		if (this.selectedChartMetric() === 'cost' || this.selectedChartMetric() === 'price') {
			return `${value.toFixed(2)} ₪`;
		}
		return value;
	}

	prevPeriod() {
		if (this.isFetching()) return;
		const start = new Date(this.startDate());
		if (this.viewMode() === 'weekly') start.setDate(start.getDate() - 7);
		else { start.setMonth(start.getMonth() - 1); start.setDate(1); }
		const end = new Date(start);
		if (this.viewMode() === 'weekly') end.setDate(start.getDate() + 6);
		else end.setMonth(start.getMonth() + 1, 0);
		this.startDate.set(this.formatDate(start));
		this.endDate.set(this.formatDate(end));
	}

	nextPeriod() {
		if (this.isFetching()) return;
		const start = new Date(this.startDate());
		let newStart = new Date(start);
		if (this.viewMode() === 'weekly') newStart.setDate(start.getDate() + 7);
		else { newStart.setMonth(start.getMonth() + 1); newStart.setDate(1); }
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (newStart > today) return;
		let newEnd = new Date(newStart);
		if (this.viewMode() === 'weekly') newEnd.setDate(newStart.getDate() + 6);
		else newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
		this.startDate.set(this.formatDate(newStart));
		this.endDate.set(this.formatDate(newEnd));
	}

	getTotalForDate(date: DateDisplay): string | number {
		const total = this.products().reduce((sum, product) => {
			const value = product.values[date.date] || 0;
			return sum + value;
		}, 0);
		return this.getTableCellValue({ name: 'Total', values: { [date.date]: total } } as ProductSummary, date);
	}


	// --- Signals for UI state ---
	isUploading = signal(false);
	isDraggingOver = signal(false);

	// --- Drag & Drop Handlers ---
	onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.isDraggingOver.set(true);
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		this.isDraggingOver.set(false);
	}

	onDrop(event: DragEvent, supplierId: number): void {
		event.preventDefault();
		this.isDraggingOver.set(false);
		const file = event.dataTransfer?.files[0];
		if (file) {
			this.uploadFile(file, supplierId);
		}
	}

	onFileSelect(event: Event, supplierId: number): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			this.uploadFile(file, supplierId);
		}
		input.value = ''; // Reset input to allow re-selecting the same file
	}

	// --- Core Logic ---
	private uploadFile(file: File, supplierId: number): void {
		if (!file.name.endsWith('.txt')) {
			this.notificationService.toast({
				severity: 'warn',
				summary: 'קובץ לא נתמך',
				detail: 'יש לבחור קובץ מסוג .txt בלבד.',
			});
			return;
		}

		this.isUploading.set(true);

		this.apiService.uploadTxtFile(file, supplierId).subscribe({
			next: (response) => {
				if (response.success) {
					this.notificationService.toast({
						severity: 'success',
						detail: `הקובץ עובד בהצלחה.`,
						life: 5000,
					});
					this.refreshData();
				} else {
					this.notificationService.toast({
						severity: 'error',
						detail: response.message || 'אירעה שגיאה לא צפויה.',
					});
				}
			},
			error: (error) => {
				this.notificationService.toast({
					severity: 'error',
					detail: error.error?.message || error.message || 'לא ניתן היה להעלות את הקובץ.',
				});
			},
			complete: () => {
				this.isUploading.set(false);
			}
		});
	}

	deleteAllOrders(supplierId: number): void {
		const supplierName = this.suppliers().find(s => s.id === supplierId)?.name || `ספק ${supplierId}`;

		this.notificationService.confirm({
			header: 'אישור מחיקה מלאה',
			message: `האם אתה בטוח שברצונך למחוק את **כל** ההזמנות של הספק **${supplierName}**? פעולה זו הינה סופית ולא ניתנת לשחזור.`,
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'כן, מחק הכל',
		}).subscribe((accepted) => {
			if (!accepted) return;

			this.apiService.deleteSupplierOrders(supplierId).subscribe({
				next: (response) => {
					this.notificationService.toast({
						severity: 'success',
						detail: `כל ההזמנות של ${supplierName} נמחקו בהצלחה.`,
					});
					this.refreshData(); // רענן את הנתונים
				},
				error: (error) => {
					this.notificationService.toast({
						severity: 'error',
						detail: error.error?.message || 'לא ניתן היה למחוק את ההזמנות.',
					});
				}
			});
		});
	}

	// Ensure you have this method in your component
	refreshOrders(): void {
		// Implement the logic to refresh the order list, for example:
		this.fetchOrders();
	}
}