import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { sysAdminGuard } from './guards/sys-admin.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./public/login/login.component').then((m) => m.LoginComponent),
	},
	{
		path: 'register',
		loadComponent: () => import('./public/register/register.component').then((m) => m.RegisterComponent),
	},

	// --- נתיבים למשתמש רגיל / Admin ---
	{
		path: '',
		component: DashboardComponent, // Layout ראשי
		canActivate: [authGuard],
		children: [
			{ path: '', loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent) },
			{ path: 'suppliers', loadComponent: () => import('./components/suppliers/suppliers.component').then((m) => m.SuppliersComponent) },
			{ path: 'suppliers/:supplierId', loadComponent: () => import('./components/suppliers/supplier/supplier.component').then((m) => m.SupplierComponent) },
			{ path: 'users', loadComponent: () => import('./components/users/users.component').then((m) => m.UsersComponent) },
			{ path: 'orders', loadComponent: () => import('./components/order-history/order-history.component').then((m) => m.OrderHistoryComponent) },


			{
				path: 'table',
				loadComponent: () => import('./components/user-table/user-table.component').then(m => m.UserTableComponent)
			},
		],
	},

	// --- ✅ נתיבים ייעודיים ל-SysAdmin (קבוצה נפרדת באותה רמה) ---
	{
		path: 'admin',
		component: DashboardComponent, // משתמש באותו Layout
		canActivate: [authGuard, sysAdminGuard],
		children: [
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full'
			},
			{
				path: 'dashboard',
				loadComponent: () => import('./components/admin/admin-dashboard-component/admin-dashboard-component.component').then(m => m.AdminDashboardComponentComponent)
			},
			{
				path: 'accounts', // נתיב: /admin/accounts
				loadComponent: () => import('./components/admin/accounts/accounts.component').then(m => m.AccountsComponent)
			},
			{
				path: 'tiers', // נתיב: /admin/tiers
				loadComponent: () => import('./components/admin/tiers/tiers.component').then(m => m.TiersComponent)
			},





		]
	},

	// תופס את כל שאר הנתיבים שלא נמצאו
	{ path: '**', redirectTo: '', pathMatch: 'full' },
];