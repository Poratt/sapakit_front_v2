import { EnumData } from '../models/enumData';

export enum OrderStatus {
  Empty = 1,
  Draft,
  Sent,
  Today,
  Future,
}

export const orderStatusData: EnumData[] = [
  {
    enumValue: OrderStatus.Empty,
    label: 'ריקה',
    // icon: 'pi pi-times-circle',
    icon: '',
    tailwind: 'bg-gradient-to-r from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200',
  },
  {
    enumValue: OrderStatus.Draft,
    label: 'טיוטה',
    icon: 'pi pi-file-edit',
    tailwind: 'bg-gradient-to-r from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200',
  },
  {
    enumValue: OrderStatus.Sent,
    label: 'נשלחה',
    icon: 'pi pi-check-circle',
    tailwind: 'bg-gradient-to-r from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200',
  },
  {
    enumValue: OrderStatus.Today,
    label: 'הזמנה להיום',
    icon: 'pi pi-bell',
    tailwind: 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
  },
  {
    enumValue: OrderStatus.Future,
    label: 'הזמנה עתידית',
    icon: 'pi pi-clock',
    tailwind: 'bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
  },
];




// import { EnumData } from '../models/enumData';

// export enum OrderStatus {
// 	New = 1,
// 	Draft, // טיוטה
// 	Sent, // נשלח
// }

// export const orderStatusData: EnumData[] = [
// 	{
// 		enumValue: OrderStatus.New,
// 		label: 'חדשה',
// 		icon: 'pi pi-plus-circle',
// 		tailwind:
// 			'bg-gradient-to-r from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 ',
// 	},
// 	{
// 		enumValue: OrderStatus.Draft,
// 		label: 'טיוטה',
// 		tailwind:
// 			'bg-gradient-to-r from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 ',
// 		icon: 'pi pi-file-edit',
// 	},
// 	{
// 		enumValue: OrderStatus.Sent,
// 		label: 'נשלחה',
// 		icon: 'pi pi-check-circle',
// 		tailwind:
// 			'bg-gradient-to-r from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 ',
// 	},
// ];

// export enum OrderViewStatus {
//     Past = 1,    // היסטורית
//     Today,       // היום
//     Future,      // עתידית
// }

// export const orderViewStatusData: EnumData[] = [
//     {
//         enumValue: OrderViewStatus.Past,
//         label: 'הזמנה היסטורית',
//         icon: 'pi pi-history',
//         tailwind: 'bg-gray-100 hover:bg-gray-200'
//     },
//     {
//         enumValue: OrderViewStatus.Today,
//         label: 'הזמנה להיום',
//         icon: 'pi pi-calendar',
//         tailwind: 'bg-p-100 hover:bg-p-200'
//     },
//     {
//         enumValue: OrderViewStatus.Future,
//         label: 'הזמנה עתידית',
//         icon: 'pi pi-forward',
//         tailwind: 'bg-secondary-100 hover:bg-secondary-200'
//     }
// ];
