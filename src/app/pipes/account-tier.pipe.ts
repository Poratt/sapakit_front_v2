import { Pipe, PipeTransform, inject } from '@angular/core';
import { TierStore } from '../store/tier.store';

@Pipe({
  name: 'accountTierLabel',
  standalone: true,
})
export class AccountTierPipe implements PipeTransform {
  private tierStore = inject(TierStore);

  // ה-pipe יקבל מספר (או null/undefined)
  transform(tierId: number | undefined | null): string {
    if (tierId === null || tierId === undefined) {
      return 'לא מוגדר';
    }

    const allTiers = this.tierStore.tiers();
    if (!allTiers || allTiers.length === 0) {
        return 'טוען...'; // מצב ביניים בזמן שה-store נטען
    }

    const tierData = allTiers.find(t => t.id == tierId); // השוואה לא קפדנית (==)
    
    return tierData ? tierData.name : 'לא ידוע';
  }
}