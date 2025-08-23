import { NotificationService } from '../../../services/notification.service';
import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { OrderStatus, orderStatusData } from '../../../common/enums/order-status.enum';
import { OrderStatusPipe } from '../../../pipes/orderStatus.pipe';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { OrderStore } from '../../../store/order.store';
import { HebrewDatePipe } from "../../../pipes/hebrew-date.pipe";
import { Order } from '../../../common/models/order';

@Component({
  selector: 'app-orders-list-dialog',
  templateUrl: './orders-list-dialog.component.html',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, BadgeComponent, OrderStatusPipe, HebrewDatePipe],
})
export class OrdersListDialogComponent {
  private ref = inject(DynamicDialogRef);
  private orderStore = inject(OrderStore);
  private notificationService = inject(NotificationService);
  private config = inject(DynamicDialogConfig);

  readonly OrderStatus = OrderStatus;
  readonly orderStatusData = orderStatusData;

  readonly isLoading = this.orderStore.isLoading;

  readonly orders = computed(() => {
    const status = this.config.data?.status;
    if (status === OrderStatus.Today) {
      console.log(this.orderStore.todayOrdersComputed());      
      return this.orderStore.todayOrdersComputed();
    }
    console.log(this.orderStore.draftOrdersList());
    
    return this.orderStore.draftOrdersList();
  });



constructor() {

  }

  ngOnInit(): void {
    const displayStatus = this.config.data?.status;

    if (displayStatus === OrderStatus.Draft) {
      this.orderStore.loadDraftOrders();
    }
    // For 'Today' orders, no specific load is needed as it's a computed signal.
  }

  ngOnDestroy(): void {
  }

  viewOrder(order: Order): void {
    if (!order.id) {
      this.ref.close({ action: 'create', data: order });
    } else {
      this.ref.close({ action: 'edit', data: order });
    }
  }
  editOrder(order: Order): void {
    if (!order.id) return;
    this.ref.close({ action: 'edit', data: order });
  }

  createOrder(virtualOrder: Order): void {
    this.ref.close({ action: 'create', data: virtualOrder });
  }

  confirmRemoveDraft(order: Order): void {
    if (!order.id) return;

    this.notificationService.confirm({
      message: 'האם למחוק את טיוטת ההזמנה?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן, מחק',
      rejectLabel: 'בטל',
    }).subscribe((accepted) => {
      if (accepted) {
        this.removeDraft(order);
      }
    });
  }

  removeDraft(order: Order): void {
    this.ref.close({ action: 'delete', data: order });
  }
}