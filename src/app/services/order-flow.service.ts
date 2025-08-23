import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderDialogComponent } from '../components/dialogs/order-dialog/order-dialog.component';
import { WhatsAppInstructionDialogComponent, InstructionConfig } from '../components/dialogs/whatsapp-instruction-dialog/whatsapp-instruction-dialog.component'; // עדכון הנתיב
import { OrderStore } from '../store/order.store';

import { CreateOrderDto } from '../common/dto/order-create.dto';
import { OrderStatus } from '../common/enums/order-status.enum';
import { DialogConfigWide, DialogConfig } from '../common/const/dialog-config';
import { Order } from '../common/models/order';
import { Supplier } from '../common/models/supplier';

export interface OpenOrderDialogData {
	supplier: Supplier;
	date: Date;
	existingOrder?: Order | null;
}

@Injectable({
	providedIn: 'root'
})
export class OrderFlowService {
	private readonly dialogService = inject(DialogService);
	private readonly orderStore = inject(OrderStore);

	public openOrderDialog(data: OpenOrderDialogData): void {
		const { supplier, date, existingOrder } = data;
		console.log(date);
		
		const ref = this.dialogService.open(OrderDialogComponent, {
			...DialogConfigWide,
			styleClass: 'no-header',
			data: { supplier, date, existingOrder },
			
		});

		ref.onClose.subscribe((result: any | null) => {
			if (!result) return;

			if (result.action === 'SEND_WHATSAPP') {
				this.handleWhatsAppAction(result.payload, supplier.name, result.whatsAppResult);
			} else {
				this.handleStandardAction(result, supplier, date);
			}
		});
	}

	private handleWhatsAppAction(payload: CreateOrderDto, supplierName: string, whatsAppResult: any) {
		this.orderStore.saveOrder(payload);

		const instructionConfig: InstructionConfig = {
			supplierName: supplierName,
			method: whatsAppResult.method,
			autoHide: whatsAppResult.method === 'whatsapp',
			autoHideDelay: 5000
		};

		this.showInstructionDialog(instructionConfig, payload);
	}

	private showInstructionDialog(config: InstructionConfig, originalPayload: CreateOrderDto) {
		const dialogRef = this.dialogService.open(WhatsAppInstructionDialogComponent, {
			...DialogConfig,
			styleClass: 'no-header no-padding', // קלאסים לעיצוב הדיאלוג ללא header
			data: config
		});

		dialogRef.onClose.subscribe((action: 'retry' | 'close' | undefined) => {
			if (action === 'retry') {
				// אם המשתמש רוצה לנסות שוב, נפעיל את הלוגיקה מחדש
				this.handleWhatsAppAction(originalPayload, config.supplierName || '', { method: 'whatsapp' }); // נניח ניסיון חוזר לוואטסאפ
			}
		});
	}

	private handleStandardAction(result: any, supplier: Supplier, date: Date) {
		let orderPayload: CreateOrderDto | null = null;
		const formattedDate = this.formatDate(date);

		if ('delete' in result && result.delete) {
			orderPayload = { id: result.orderId, supplierId: supplier.id, date: formattedDate, status: OrderStatus.Empty, products: [] };
		} else if ('payload' in result) {
			orderPayload = result.payload;
		} else if ('supplierId' in result) {
			orderPayload = result;
		}

		if (orderPayload) {
			this.orderStore.saveOrder(orderPayload);
		}
	}

	private formatDate(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}
}