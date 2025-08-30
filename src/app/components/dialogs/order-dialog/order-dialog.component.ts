import { ChangeDetectionStrategy, Component, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragMove } from '@angular/cdk/drag-drop';
import { map, tap } from 'rxjs/operators';
import { OrderStatus, orderStatusData } from '../../../common/enums/order-status.enum';
import { Package, PackageData } from '../../../common/enums/package';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';
import { ScrollService } from '../../../services/scroll.service';
import { CreateOrderDto } from '../../../common/dto/order-create.dto';
import { fadeIn400 } from '../../../common/const/animations';
import { CountUpComponent } from "../../shared/count-up/count-up.component";
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OrderPrintTemplate, PrintConfig, PrintService } from '../../../services/print.service';
import { AuthStore } from '../../../store/auth.store';
import { UserRole } from '../../../common/enums/userRole.enum';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { WhatsAppService } from '../../../services/whatsapp.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { getHebrewDayName } from '../../../pipes/hebrewDay.pipe';
import { CategoryStore } from '../../../store/category.store';
import { SupplierStore } from '../../../store/supplier.store';
import { Order } from '../../../common/models/order';
import { PageStates } from '../../../common/models/pageStates';
import { Product } from '../../../common/models/product';
import { ServiceResultContainer } from '../../../common/models/serviceResultContainer';
import { Supplier } from '../../../common/models/supplier';
import { PluralizePackagePipe } from '../../../pipes/pluralize-package.pipe';




interface GroupedProducts {
  categoryName: string;
  products: Product[];
}

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ImageModule,
    InputNumberModule,
    TextareaModule,
    TableModule,
    BadgeComponent,
    LoaderComponent,
    MessageModule,
    TooltipModule,
    DragDropModule,
    CountUpComponent,
    ConfirmDialogModule,
    ToggleSwitchModule,
    SplitButtonModule,
    PluralizePackagePipe
  ],
  providers: [ConfirmationService, PluralizePackagePipe],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn400]
})
export class OrderDialogComponent {
  // --- Stores ---
  private readonly categoryStore = inject(CategoryStore);
  private readonly supplierStore = inject(SupplierStore);
  private readonly authStore = inject(AuthStore);

  // Injections
  private ApiService = inject(ApiService);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private scrollService = inject(ScrollService);
  private printService = inject(PrintService);
  private whatsAppService = inject(WhatsAppService);

  private pluralizePipe = inject(PluralizePackagePipe);

  UserRole = UserRole;
  readonly user = this.authStore.user;
  readonly isAdmin = computed(() => {
    return this.user()?.role == UserRole.Admin
  })
  // ViewChild
  @ViewChild('dialogContent', { static: false }) dialogContent!: ElementRef;

  // Signals and Properties
  PageStates = signal(PageStates);
  pageState = signal(PageStates.Loading);

  supplier: Supplier | null = this.config.data?.supplier || null;
  date: Date | null = this.config.data?.date || null;
  existingOrder: Order | null = this.config.data?.existingOrder || null;
  orderStatus: OrderStatus = this.existingOrder?.status || OrderStatus.Empty;
  packageData = PackageData;
  orderStatusData = orderStatusData;
  OrderStatus = OrderStatus;

  availableProducts = signal<Product[]>([]);
  orderProducts = signal<{ [productId: number]: number }>({});
  notes = signal<string>('');
  orderedAvailableProducts = signal<Product[]>([]);

  public suggestionItems = computed<MenuItem[]>(() => {
    const dayName = getHebrewDayName(this.date);

    return [
      {
        label: 'לפי 10 הזמנות אחרונות',
        icon: 'pi pi-history',
        command: () => this.fetchSuggestions('general')
      },
      {
        label: `לפי 10 ימי ${dayName} אחרונים`,
        icon: 'pi pi-calendar',
        command: () => this.fetchSuggestions('daySpecific')
      }
    ];
  });
  public isSuggesting = signal(false);

  private initialOrderProducts: { [productId: number]: number } = {};
  private initialNotes: string = '';

  // Computed Signals
  readonly groupedProducts = computed<GroupedProducts[]>(() => {
    const products = this.orderedAvailableProducts();
    const grouped: { [key: string]: Product[] } = {};

    products.forEach(product => {
      const categoryName = product.categoryName || 'ללא קטגוריה';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(product);
    });

    return Object.keys(grouped).map(categoryName => ({
      categoryName,
      products: grouped[categoryName],
    }));
  });

  readonly orderHasProducts = computed<boolean>(() => {
    return Object.values(this.orderProducts()).some(quantity => quantity > 0);
  });

  readonly orderChanged = computed<boolean>(() => {
    if (this.notes() !== this.initialNotes) {
      return true;
    }
    const currentProducts = this.orderProducts();
    const initialProducts = this.initialOrderProducts;
    const allProductIds = Object.keys(currentProducts);

    if (allProductIds.length !== Object.keys(initialProducts).length) {
      return true;
    }

    return allProductIds.some(id => currentProducts[+id] !== initialProducts[+id]);
  });

  readonly isDisabled = computed(() => !!(this.existingOrder && this.existingOrder.status === OrderStatus.Sent));

  readonly dragAndDropEnable = signal<boolean>(false);

  readonly canUserDelete = computed<boolean>(() => {
    const user = this.authStore.user();
    if (!this.existingOrder) return false; // Can't delete a non-existent order
    if (user?.role === UserRole.Admin) return true; // Admin can always delete
    return !this.isDisabled(); // Other users can only delete if not disabled (i.e., not sent)
  });


  ngOnInit() {
    this.getData();
  }

  ngOnDestroy() {
    this.scrollService.stopAutoScroll();
  }


// in order-dialog.component.ts

private getData() {
    if (!this.supplier?.id) {
        this.pageState.set(PageStates.Error);
        return;
    }

    this.pageState.set(PageStates.Loading);
    this.ApiService.getProductsBySupplier(this.supplier.id).pipe(
        // ✅ התיקון כאן: השתמש ב-tap במקום map
        tap((response: ServiceResultContainer<Product[]>) => {
            if (response.success && response.result) {
                // אם יש תוצאות, טפל בהן
                if (response.result.length > 0) {
                    this.availableProducts.set(response.result);

                    const products: { [productId: number]: number } = {};
                    response.result.forEach(product => {
                        products[product.id] =
                            this.existingOrder?.orderProducts?.find(p => p.productId === product.id)?.quantity || 0;
                    });

                    this.initialOrderProducts = { ...products };
                    this.initialNotes = this.existingOrder?.notes || '';

                    this.orderProducts.set(products);
                    this.notes.set(this.initialNotes);

                    this.orderedAvailableProducts.set(response.result);
                    this.pageState.set(PageStates.Ready);
                } else {
                    // ✅ אם יש הצלחה אבל התוצאה היא מערך ריק
                    this.pageState.set(PageStates.Empty);
                }
            } else {
                // ✅ אם ה-API החזיר success: false
                this.pageState.set(PageStates.Error);
            }
        })
    ).subscribe({
        // אנחנו יכולים להשאיר את בלוק ה-next ריק, כי tap כבר עשה את העבודה
        next: () => { /* Logic is now in tap */ },
        error: () => this.pageState.set(PageStates.Error),
    });
}


  resetForm(): void {
    this.orderProducts.set({ ...this.initialOrderProducts });
    this.notes.set(this.initialNotes);
    this.notificationService.toast({
      severity: 'info',
      summary: 'איפוס',
      detail: 'השינויים בוטלו.',
      life: 2000
    });
  }

  // Product Management
  // private getDisplayedProducts(): Product[] {
  //   if (this.existingOrder?.status === OrderStatus.Sent) {
  //     return this.orderedAvailableProducts().filter(product => this.orderProducts()[product.id] > 0);
  //   }
  //   return this.orderedAvailableProducts();
  // }

  updateProductQuantity(productId: number, quantity: number | null | undefined) {
    if (this.isDisabled()) return;
    this.orderProducts.update(products => ({ ...products, [productId]: quantity ?? 0 }));
  }

  incrementQuantity(productId: number): void {
    this.updateProductQuantity(productId, (this.orderProducts()[productId] || 0) + 1);
  }

  onMinusClick(event: Event, productId: number): void {
  event.stopPropagation(); // מונע את ה-bubbling של האירוע ל-product-wrapper
  this.decrementQuantity(productId);
}

  decrementQuantity(productId: number): void {
    const currentQuantity = this.orderProducts()[productId] || 0;
    if (currentQuantity > 0) {
      this.updateProductQuantity(productId, currentQuantity - 1);
    }
  }

  getProductQuantity(productId: number): number {
    return this.orderProducts()[productId] || 0;
  }

  canDecrement(productId: number): boolean {
    return !this.isDisabled() && this.getProductQuantity(productId) > 0;
  }

  canIncrement(productId: number): boolean {
    return !this.isDisabled();
  }

  // Cost Calculations
  getProductTotalCost(product: Product): number {
    return product.cost * this.getProductQuantity(product.id);
  }

  getSelectedProductsTotalCost(): number {
    return this.availableProducts().reduce((total, product) => total + this.getProductTotalCost(product), 0);
  }

  // Order Management
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }


  // in src/app/components/dialogs/order-dialog/order-dialog.component.ts

  saveOrder() {
    if (!this.supplier || !this.date) return;

    // --- START OF FIX ---
    // בניית רשימת מוצרים נקייה לשליחה
    const productsForPayload = [];
    const currentOrderProducts = this.orderProducts();
    const allAvailableProducts = this.availableProducts();

    for (const productId in currentOrderProducts) {
      // ודא שהמפתח שייך לאובייקט עצמו
      if (Object.prototype.hasOwnProperty.call(currentOrderProducts, productId)) {
        const quantity = currentOrderProducts[productId];

        // הוסף ל-payload רק אם הכמות גדולה מ-0
        if (quantity > 0) {
          const productDetails = allAvailableProducts.find(p => p.id === +productId);
          const costAsNumber = productDetails ? parseFloat(productDetails.cost as any) : 0;

          productsForPayload.push({
            productId: +productId,
            name: productDetails?.name || 'Unknown Product',
            quantity: quantity,
            cost: isNaN(costAsNumber) ? 0 : costAsNumber,
          });
        }
      }
    }
    // --- END OF FIX ---

    const hasProducts = productsForPayload.length > 0;
    const hasNotes = this.notes() && this.notes().trim().length > 0;

    if (hasProducts || hasNotes) {
      const orderPayload: CreateOrderDto = {
        id: this.existingOrder?.id,
        supplierId: this.supplier.id,
        date: this.formatDate(this.date),
        status: OrderStatus.Draft,
        notes: this.notes().trim() || undefined,
        products: productsForPayload // שימוש במערך הנקי שיצרנו
      };

      console.log('--- Sending CLEANED Order Payload ---');
      console.log(JSON.stringify(orderPayload, null, 2));

      this.ref.close(orderPayload);

    } else if (this.existingOrder) {
      this.confirmRemove();
    } else {
      this.closeDialog();
    }
  }

  confirmRemove(): void {
    if (!this.existingOrder) return;

    const message = `האם למחוק את ${this.orderStatus === OrderStatus.Draft ? 'טיוטת ההזמנה' : 'ההזמנה'}?\nלא ניתן לשחזר פעולה זו.`;

    this.notificationService.confirm({
      message: message,
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן, מחק',
      rejectLabel: 'בטל',
    }).subscribe((accepted) => {
      if (accepted) {
        this.removeDraft();
      }
    });
  }

  private removeDraft(): void {
    if (!this.existingOrder) return;
    this.ref.close({ delete: true, orderId: this.existingOrder.id });
  }


  async sendOrderViaWhatsApp(): Promise<void> {
    if (!this.supplier || !this.date) return;

    // יצירת payload והודעה נשארת זהה
    const productsForPayload = Object.entries(this.orderProducts())
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = this.availableProducts().find(p => p.id === +productId);

        return {
          productId: +productId,
          name: product?.name || 'Unknown',
          quantity,
          package: product?.package || Package.Unit,
          notes: product?.notes || '',
        };
      });

    if (productsForPayload.length === 0 && !(this.notes() && this.notes().trim())) {
      return;
    }

    const orderPayload: CreateOrderDto = {
      id: this.existingOrder?.id,
      supplierId: this.supplier.id,
      date: this.formatDate(this.date),
      status: OrderStatus.Sent,
      notes: this.notes().trim() || undefined,
      products: productsForPayload,
    };

    const messageBody = this.createOrderMessage(productsForPayload);
    try {
      const whatsAppResult = await this.whatsAppService.sendMessageWithFallback({
        phone: this.supplier.phone,
        message: messageBody,
        countryCode: '972'
      });

      this.ref.close({
        action: 'SEND_WHATSAPP',
        payload: orderPayload,
        whatsAppResult: whatsAppResult
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      // במקרה של שגיאה קריטית, סגור עם מצב שגיאה
      this.ref.close({
        action: 'SEND_WHATSAPP',
        payload: orderPayload,
        whatsAppResult: { success: false, method: 'failed' }
      });
    }
  }



  private createOrderMessage(products: { name: string; quantity: number; package: Package; notes?: string }[]): string {
    // Create the products list with each product formatted
    const productsList = products
      .map(p => {
        // Get formatted quantity and unit using pluralizePipe
        const quantityAndUnitText = this.pluralizePipe.transform(p.quantity, p.package);
        console.log(quantityAndUnitText);

        // Get package label from PackageData or fallback to 'יחידה'
        const packageLabel = PackageData.find(pd => pd.enumValue === p?.package)?.label || 'יחידה';
        console.log(packageLabel);

        // Format each product line
        return ` ${quantityAndUnitText} ${p.name}${p.notes ? ' - ' + p.notes : ''}`;
      })
      .join('\n');

    // Initialize message body with products list
    let messageBody = productsList;

    // Add notes if they exist and are not empty
    if (this.notes() && this.notes().trim()) {
      messageBody += `\n\nהערות: ${this.notes()}`;
    }

    // Check if messageBody is empty
    if (!messageBody.trim()) {
      console.warn('Warning: Attempting to send an empty message to WhatsApp');
      return '';
    }

    // Wrap the message with RTL Unicode control characters
    return `\u202B${messageBody}\u202C`;
  }

  fetchSuggestions(mode: 'general' | 'daySpecific'): void {
    if (!this.supplier || !this.date) return;

    this.isSuggesting.set(true);
    this.ApiService.getOrderSuggestions(this.supplier.id, this.date, mode).subscribe({
      next: (response) => {
        if (response.success && response.result) {
          if (response.result.length === 0) {
            this.notificationService.toast({ severity: 'info', summary: 'אין נתונים', detail: 'לא נמצאו הזמנות קודמות לחישוב ממוצע.' });
          } else {
            this.orderProducts.update(currentProducts => {
              const newProducts = { ...currentProducts };
              response.result.forEach(suggestion => {
                newProducts[suggestion.productId] = suggestion.averageQuantity;
              });
              return newProducts;
            });
            this.notificationService.toast({ severity: 'success', detail: 'הכמויות מולאו אוטומטית.' });
          }
        }
      },
      error: () => { /* טיפול בשגיאה */ },
      complete: () => this.isSuggesting.set(false),
    });
  }

  printOrder(): void {
    const orderData = {
      supplier: this.supplier,
      date: this.date,
      products: this.availableProducts()
        .filter(p => this.getProductQuantity(p.id) > 0)
        .map(p => ({
          id: p.id,
          name: p.name,
          quantity: this.getProductQuantity(p.id)
        })),
      notes: this.notes()
    };

    const config: PrintConfig = {
      title: `הזמנה - ${this.supplier?.name}`,
      direction: 'rtl'
    };

    this.printService.printWithTemplate(orderData, new OrderPrintTemplate(), config);
  }


  async pasteFromClipboard(): Promise<void> {
    if (this.isDisabled()) return;

    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        this.notificationService.toast({ severity: 'info', detail: 'לוח ההעתקה ריק.' });
        return;
      }

      const allProducts = this.availableProducts();
      // צור עותק שניתן לשנות
      const newQuantities: { [key: number]: number } = { ...this.orderProducts() };
      let itemsFound = 0;
      let unfoundLines: string[] = [];

      const lines = text.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const numbers = trimmedLine.match(/\d+/g);
        const textPart = trimmedLine.replace(/\d+/g, '').trim();

        if (!textPart) continue;

        let bestMatch: Product | undefined = undefined;
        for (const product of allProducts) {
          if (textPart.toLowerCase().includes(product.name.toLowerCase())) {
            if (!bestMatch || product.name.length > bestMatch.name.length) {
              bestMatch = product;
            }
          }
        }

        if (bestMatch) {
          const quantity = numbers && numbers.length > 0 ? parseInt(numbers[0], 10) : 1;
          if (quantity > 0) {
            // כאן TypeScript יבין את ההקשר נכון
            newQuantities[bestMatch.id] = (newQuantities[bestMatch.id] || 0) + quantity;
            itemsFound++;
          }
        } else {
          unfoundLines.push(trimmedLine);
        }
      }

      if (itemsFound > 0) {
        this.orderProducts.set(newQuantities);
        let successMessage = `זוהו והוספו ${itemsFound} פריטים.`;
        if (unfoundLines.length > 0) {
          successMessage += ` (${unfoundLines.length} שורות לא זוהו)`;
          this.notificationService.toast({ severity: 'success', summary: 'ההדבקה הצליחה חלקית', detail: successMessage, life: 5000 });
        } else {
          this.notificationService.toast({ severity: 'success', detail: successMessage });
        }
      } else {
        this.notificationService.toast({ severity: 'warn', detail: 'לא זוהו מוצרים תואמים בטקסט שהודבק.' });
      }

    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      this.notificationService.toast({ severity: 'error', detail: 'לא ניתן לגשת ללוח ההעתקה. בדוק הרשאות דפדפן.' });
    }
  }

  skipOrder(): void {
    this.notificationService.confirm({
      message: 'האם אתה בטוח שברצונך לדלג על הזמנה זו?.',
      header: 'אישור דילוג על הזמנה',
      icon: 'pi pi-forward',
      acceptLabel: 'כן, דלג',
      rejectLabel: 'בטל',
    }).subscribe((accepted) => {
      if (accepted) {
        if (!this.supplier || !this.date) return;

        // צור payload של הזמנה ריקה בסטטוס "נשלחה"
        const skipPayload: CreateOrderDto = {
          id: this.existingOrder?.id,
          supplierId: this.supplier.id,
          date: this.formatDate(this.date),
          status: OrderStatus.Empty, // <-- סטטוס "נשלחה"
          notes: 'הזמנה זו סומנה כ"נדלגה" על ידי המשתמש.',
          products: [] // ללא מוצרים
        };

        // סגור את הדיאלוג והחזר את ה-payload
        this.ref.close(skipPayload);
      }
    });
  }

  navigateToSupplier() {
    this.ref.close(null);
    if (this.supplier) this.router.navigate(['/suppliers', this.supplier.id]);
  }

  closeDialog() {
    this.ref.close(null);
  }

  onClose(): void {
    this.ref.close(null);
  }

  // Below methods are for drag & drop, no changes needed
  dropProduct(event: CdkDragDrop<Product[]>) {
    if (event.previousContainer === event.container) moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    else transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    this.updateProductsOrderFromGroups();
  }
  dropCategory(event: CdkDragDrop<GroupedProducts[]>) {
    const currentGroups = this.groupedProducts();
    moveItemInArray(currentGroups, event.previousIndex, event.currentIndex);
    this.updateProductsOrderFromGroups(currentGroups);
  }
  private updateProductsOrderFromGroups(groups: GroupedProducts[] | null = null) {
    const newOrderedProducts: Product[] = [];
    (groups || this.groupedProducts()).forEach(group => newOrderedProducts.push(...group.products));
    this.orderedAvailableProducts.set(newOrderedProducts);
  }
  onDragMoved(event: CdkDragMove) {
    this.scrollService.onDragMoved(event, this.dialogContent);
  }

}