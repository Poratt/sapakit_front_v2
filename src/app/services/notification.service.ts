import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, map, throwError } from 'rxjs';
import { ConfirmationData, ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogConfig } from '../common/const/dialog-config';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	private messageService = inject(MessageService);
	private notifyTimeout?: ReturnType<typeof setTimeout>;
	private dialogService = inject(DialogService);
	private _notify = signal<notificationMessage | undefined>(undefined);

	private iconsMap: Record<string, string> = {
		success: 'pi pi-check',
		error: 'pi pi-times-circle',
		warn: 'pi pi-exclamation-triangle',
		info: 'pi pi-info-circle',
	};

	constructor() { }

	public handleError(error: HttpErrorResponse): Observable<never> {
        let displayMessage = 'אירעה שגיאה. אנא נסה שוב מאוחר יותר.';

        if (error.status === 0) {
            // This is a client-side or network error.
            displayMessage = 'לא ניתן להתחבר לשרת. אנא בדוק את חיבור האינטרנט שלך.';
        } else if (error.status >= 400 && error.status < 500) {
            // Client-side errors (e.g., 401, 404) - often have a specific message.
            displayMessage = error.error?.message || `שגיאת לקוח (${error.status})`;
        } else if (error.status >= 500) {
            // Server-side errors
            displayMessage = `שגיאת שרת (${error.status}). נסה שוב מאוחר יותר.`;
        }

        this.toast({
            severity: 'error',
            // summary: 'שגיאת תקשורת',
            detail: displayMessage,
            life: 5000
        });

        console.error('HTTP error intercepted:', error);
        return throwError(() => new Error(displayMessage));
    }

	
	toast(message: Message | Message[]) {
		if (Array.isArray(message)) {
			message = message.map((msg) => this.setDefaultIcon(msg));
			this.messageService.addAll(message);
		} else {
			message = this.setDefaultIcon(message);
			this.messageService.add(message);
		}
	}

	private setDefaultIcon(message: Message): Message {
		if (!message.icon && message.severity) {
			message.icon = this.iconsMap[message.severity] || 'pi pi-info-circle';
		}
		return message;
	}

	get notification() {
		return this._notify;
	}

	notify(notification: notificationMessage, timeout: number = 4000) {
		clearTimeout(this.notifyTimeout);

		if (Array.isArray(notification.message)) {
			notification.message = notification.message.join('<br>');
		}
		this._notify.set(notification);
		this.notifyTimeout = setTimeout(() => {
			this.dismiss();
		}, timeout);
	}

	dismiss() {
		this._notify.set(undefined);
	}


	public confirm(data: ConfirmationData): Observable<boolean> {
		const ref = this.dialogService.open(ConfirmationDialogComponent, {
			header: data.header || 'אישור פעולה',
			...DialogConfig,
			width: 'clamp(320px, 40%, 450px)',
			data: data,
		});

		return ref.onClose.pipe(
			// ודא שאנחנו תמיד מחזירים בוליאני
			map(result => !!result)
		);
	}
}

export type notificationMessage = {
	message?: string | string[];
	type: 'error' | 'success' | 'warning' | 'info';
};

export type Message = {
	severity?: string;
	summary?: string;
	detail?: string;
	id?: any;
	key?: string;
	life?: number;
	sticky?: boolean;
	closable?: boolean;
	data?: any;
	icon?: string;
	contentStyleClass?: string;
	styleClass?: string;
	closeIcon?: string;
	header?: string;
};

// import { inject, Injectable, input, signal } from '@angular/core';
// import { MessageService } from 'primeng/api';

// @Injectable({
//   providedIn: 'root'
// })
// export class NotificationService {
//    static messageService = inject(MessageService);
//   constructor() { }

//   private static notifyTimeout?: ReturnType<typeof setTimeout>;

//   private static _notify = signal<notificationMessage | undefined>(undefined);
//   public static message = signal<Message | Message[] | undefined>(undefined);

//   private static iconsMap: Record<string, string> = {
//     success: 'check_circle',
//     error: 'error',
//     warn: 'warning',
//     info: 'info'
//   };

//   public static get notification() {
//     return NotificationService._notify;
//   }

//   public static toast(message: Message | Message[]) {
//     if (Array.isArray(message)) {
//       message = message.map(msg => this.setDefaultIcon(msg));
//     } else {
//       message = this.setDefaultIcon(message);
//     }
//     this.message.set(message);
//   }

//   private static setDefaultIcon(message: Message): Message {
//     if (!message.icon && message.severity) {
//       message.icon = this.iconsMap[message.severity] || 'info';
//     }
//     return message;
//   }

//   public static notify(notification: notificationMessage, timeout: number = 4000) {
//     clearTimeout(this.notifyTimeout)

//     // if array, join with <br> to display in multiple lines
//     if (Array.isArray(notification.message)) {
//       notification.message = notification.message.join('<br>');
//     }
//     NotificationService._notify.set(notification);
//     this.notifyTimeout = setTimeout(() => {
//       NotificationService.dismiss();
//     }, timeout);
//   }

//   public static dismiss() {
//     NotificationService._notify.set(undefined);
//   }

// }

// export type notificationMessage = {
//   message?: string | string[];
//   type: 'error' | 'success' | 'warning' | 'info';
// }

// export type Message = {
//   severity?: string;
//   summary?: string;
//   detail?: string;
//   id?: any;
//   key?: string;
//   life?: number;
//   sticky?: boolean;
//   closable?: boolean;
//   data?: any;
//   icon?: string;
//   contentStyleClass?: string;
//   styleClass?: string;
//   closeIcon?: string;
//   header?: string;
// }
