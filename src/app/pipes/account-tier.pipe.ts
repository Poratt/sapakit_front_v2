import { Pipe, PipeTransform } from '@angular/core';
import { AccountTier, AccountTierData } from '../common/enums/account-tier.enums';

@Pipe({
	name: 'accountTierLabel',
	standalone: true,
})

export class AccountTierPipe implements PipeTransform {
	transform(value: AccountTier | string | undefined | null): string {
		if (value === null || value === undefined) {
			return 'לא מוגדר';
		}

		// השוואה לא קפדנית (==) תטפל במקרים של '1' == 1
		const tierData = AccountTierData.find(t => t.enumValue == value);

		return tierData ? tierData.label : 'לא ידוע';
	}

}