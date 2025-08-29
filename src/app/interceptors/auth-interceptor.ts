import {
	HttpInterceptor,
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private authService = inject(AuthService);
	private notificationService = inject(NotificationService);



	private isRefreshing = false;
	private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
		string | null
	>(null);

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// הוסף את הטוקן אם הוא קיים בזיכרון
		const authReq = this.addTokenHeader(request);

		return next.handle(authReq).pipe(
			catchError((error) => {
				if (error.status === 0) {
                    const customError = { message: 'לא ניתן להתחבר לשרת. אנא בדוק את חיבור האינטרנט או נסה שוב מאוחר יותר.' };
                    
                    // ❌ אל תציג הודעה כאן
                    // this.notificationService.toast(...);
                    
                    // ✅ רק תזרוק את השגיאה הנקייה
                    return throwError(() => customError);
                }
				if (
					error instanceof HttpErrorResponse &&
					error.status === 401 &&
					!request.url.includes('/auth/refresh')
				) {
					return this.handle401Error(request, next);
				}

				return throwError(() => error);
			}),
		);
	}

	private handle401Error(
		request: HttpRequest<any>,
		next: HttpHandler,
	): Observable<HttpEvent<any>> {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			return this.authService.refreshToken().pipe(
				switchMap((response) => {
					this.isRefreshing = false;
					const newAccessToken = response.result?.accessToken;
					if (!newAccessToken) {
						return throwError(() => new Error('Refresh failed, no new token.'));
					}
					this.refreshTokenSubject.next(newAccessToken);
					return next.handle(this.addTokenHeader(request));
				}),
				catchError((refreshError) => {
					this.isRefreshing = false;
					// ה-Interceptor לא מבצע לוגאאוט. הוא רק מדווח על כישלון.
					// ה-Store יחליט מה לעשות.
					return throwError(() => refreshError);
				}),
			);
		} else {
			return this.refreshTokenSubject.pipe(
				filter((token) => token !== null),
				take(1),
				switchMap(() => next.handle(this.addTokenHeader(request))),
			);
		}
	}

	private addTokenHeader(request: HttpRequest<any>): HttpRequest<any> {
		const token = this.authService.getAccessToken();
		// הוסף את ה-header רק אם יש טוקן וזו לא בקשת לוגין
		if (token && !request.url.includes('/auth/login')) {
			return request.clone({
				withCredentials: true,
				setHeaders: {
					Authorization: `Bearer ${token}`,
				},
			});
		}
		// עבור בקשות ללא טוקן, רק תוסיף withCredentials
		return request.clone({
			withCredentials: true,
		});
	}
}