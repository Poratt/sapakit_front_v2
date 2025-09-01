import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { UserRole } from '../common/enums/userRole.enum';

export const sysAdminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.userRole() === UserRole.SysAdmin) {
    return true; // מורשה
  }

  // לא מורשה, שלח אותו לדף הבית הרגיל שלו
  return router.parseUrl('/'); 
};