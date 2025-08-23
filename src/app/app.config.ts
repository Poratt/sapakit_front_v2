import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptors,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import Nora from '@primeng/themes/nora';
import Lara from '@primeng/themes/lara';
import Material from '@primeng/themes/material';
import { definePreset } from '@primeng/themes';
import { MessageService } from 'primeng/api';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AuthStore } from './store/auth.store';

const MyCustomPreset = definePreset(Aura, {
	semantic: {
		primary: {
			50: 'hsl(208 100% 95% / 1)',
			100: ' hsl(208 100% 85% / 1)',
			200: ' hsl(208 100% 75% / 1)',
			300: ' hsl(208 100% 65% / 1)',
			400: ' hsl(208 100% 55% / 1)',
			500: ' hsl(208 100% 45% / 1)',
			600: ' hsl(208 100% 35% / 1)',
			700: ' hsl(208 100% 25% / 1)',
			800: ' hsl(208 100% 15% / 1)',
			900: ' hsl(208 100% 5% / 1)',
		},
		colorScheme: {
			light: {
				primary: {
					color: '{primary.500}',
					hoverColor: '{primary.600}',
					activeColor: '{primary.700}',
				},
			},
			dark: {
				primary: {
					color: '{primary.200}',
					hoverColor: '{primary.300}',
					activeColor: '{primary.400}',
				},
			},
		},
	},
});

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),

		provideAnimationsAsync(),
		providePrimeNG({
			theme: {
				preset: MyCustomPreset,
				options: {
					darkModeSelector: false || 'none',
				},
			},
		}),

		provideHttpClient(withInterceptorsFromDi()),
		MessageService,
		DialogService,
		// DynamicDialogModule,
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		provideAppInitializer((authStore = inject(AuthStore)) => {
			return authStore.initialize();
		}),
	],
};
