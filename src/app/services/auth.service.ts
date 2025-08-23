import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';
import { ServiceResultContainer } from '../common/models/serviceResultContainer';
import { User } from '../common/models/user';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private http = inject(HttpClient);
	private router = inject(Router);
	private notificationService = inject(NotificationService);

	private readonly apiUrl = environment.apiUrl;
	private accessToken: string | null = null;

	setAccessToken(token: string): void {
		this.accessToken = token;
		console.log('Access token set:', token);
	}

	getAccessToken(): string | null {
		return this.accessToken;
	}

	getCurrentUser(): Observable<User | null> {
		return this.http
			.get<ServiceResultContainer<User>>(`${this.apiUrl}/auth/user`, {
				withCredentials: true,
			})
			.pipe(
				tap((response) => console.log('Get current user response:', response)),
				map((response) => (response.success ? response.result : null)),
				catchError((err) => {
					console.error('Get current user failed:', err);
					return of(null);
				}),
			);
	}

	login(credentials: { email: string, password: string }): Observable<ServiceResultContainer<{ accessToken: string, refreshToken: string }>> {
		return this.http.post<ServiceResultContainer<{ accessToken: string, refreshToken: string }>>(
			`${this.apiUrl}/auth/login`,
			credentials
		);
	}

	logout(): Observable<any> {
		return this.http.post(`${this.apiUrl}/auth/logout`, {});
	}

	isLoggedIn(): Observable<boolean> {
		return this.getCurrentUser().pipe(
			map((user) => !!user),
			catchError(() => of(false)),
		);
	}

	authenticatedRequest<T>(url: string, body?: any): Observable<T> {
		return this.http.post<T>(`${this.apiUrl}${url}`, body, {
			withCredentials: true,
		});
	}

	refreshToken(): Observable<any> {
		return this.http
			.post<
				ServiceResultContainer<any>
			>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
			.pipe(
				tap((response) => {
					console.log('Refresh token response:', response);
					if (response.success && response.result?.accessToken) {
						this.setAccessToken(response.result.accessToken);
					} else {
						throw new Error('No access token returned from refresh');
					}
				}),
				catchError((err) => {
					console.error('Refresh token error:', err);
					this.accessToken = null;
					return throwError(() => new Error('Failed to refresh token'));
				}),
			);
	}
}
