import { Pipe, PipeTransform } from '@angular/core';
import { UserRole, userRoleData } from '../common/enums/userRole.enum';

@Pipe({
	name: 'userRole',
	standalone: true,
})
export class userRolePipe implements PipeTransform {
	transform(userRole: UserRole): string {
		const foundData = userRoleData.find((data) => data.enumValue === userRole);
		return foundData ? foundData.label : 'לא מוגדר';
	}
}

@Pipe({
	name: 'userRoleIcon',
	standalone: true,
})
export class userRoleIconPipe implements PipeTransform {
	transform(userRole: UserRole): string {
		const foundData = userRoleData.find((data) => data.enumValue === userRole);
		return foundData && foundData.icon ? foundData.icon : '';
	}
}

@Pipe({
	name: 'userRoleColor',
	standalone: true,
})
export class userRoleColorPipe implements PipeTransform {
	transform(userRole: UserRole): string {
		const foundData = userRoleData.find((data) => data.enumValue === userRole);
		return foundData && foundData.background ? foundData.background : '';
	}
}
