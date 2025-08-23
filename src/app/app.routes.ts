import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () =>
			import('../app/public/login/login.component').then((m) => m.LoginComponent),
	},
	{
		path: 'register',
		loadComponent: () =>
			import('../app/public/register/register.component').then((m) => m.RegisterComponent),
	},
	{
		path: '',
		component: DashboardComponent,
		canActivate: [authGuard], // Protect all dashboard routes
		children: [
			{
				path: '',
				loadComponent: () =>
					import('./components/home/home.component').then((m) => m.HomeComponent),
			},
			{
				path: 'suppliers',
				loadComponent: () =>
					import('./components/suppliers/suppliers.component').then(
						(m) => m.SuppliersComponent,
					),
			},
			{
				path: 'suppliers/:supplierId',
				loadComponent: () =>
					import('./components/suppliers/supplier/supplier.component').then(
						(m) => m.SupplierComponent,
					),
			},
			{
				path: 'users',
				loadComponent: () =>
					import('./components/users/users.component').then((m) => m.UsersComponent),
			},
			{
				path: 'orders',
				loadComponent: () =>
					import('./components/order-history/order-history.component').then(
						(m) => m.OrderHistoryComponent,
					),
			},



			{ path: '**', redirectTo: '', pathMatch: 'full' },
		],
	},
];

