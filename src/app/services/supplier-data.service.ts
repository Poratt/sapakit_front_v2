// // src/app/services/supplier-data.service.ts
// import { Injectable, inject } from '@angular/core';
// import { Observable } from 'rxjs';
// import { MockDataService } from './apiservice';
// import { NotificationService } from './notification.service';
// import { Supplier } from '../models/supplier';
// import { PageStates } from '../models/pageStates';
// import { ServiceResultContainer } from '../models/serviceResultContainer';

// @Injectable({ providedIn: 'root' })
// export class SupplierDataService {
// 	private mockDataService = inject(MockDataService);
// 	private notificationService = inject(NotificationService);

// 	getData(
// 		setSuppliers: (suppliers: Supplier[]) => void,
// 		setPageState: (state: PageStates) => void,
// 	): void {
// 		setPageState(PageStates.Loading);
// 		this.mockDataService.getSuppliers().subscribe({
// 			next: (response: ServiceResultContainer<Supplier[]>) => {
// 				if (response.success && response.result) {
// 					setSuppliers(response.result);
// 					setPageState(PageStates.Ready);
// 				} else {
// 					setSuppliers([]);
// 					setPageState(PageStates.Ready);
// 					this.notificationService.toast({
// 						severity: 'error',
// 						summary: 'שגיאה',
// 						detail: response.message || 'אירעה שגיאה בעת טעינת הספקים.',
// 					});
// 				}
// 			},
// 			error: () => {
// 				setSuppliers([]);
// 				setPageState(PageStates.Error);
// 				this.notificationService.toast({
// 					severity: 'error',
// 					summary: 'שגיאה',
// 					detail: 'אירעה שגיאה בעת טעינת הנתונים.',
// 				});
// 			},
// 		});
// 	}

// 	saveSupplier(
// 		supplier: Supplier,
// 		setSuppliers: (suppliers: Supplier[]) => void,
// 		suppliers: Supplier[],
// 		setPageState: (state: PageStates) => void,
// 	): void {
// 		// בדיקת ייחודיות שם בפרונט
// 		const isNameTaken = suppliers.some((s) => s.name === supplier.name && s.id !== supplier.id);
// 		if (isNameTaken) {
// 			this.notificationService.toast({
// 				severity: 'error',
// 				// summary: 'שגיאה',
// 				detail: 'שם הספק כבר קיים',
// 			});
// 			return;
// 		}

// 		if (supplier.id) {
// 			this.mockDataService.updateSupplier(supplier.id, supplier).subscribe({
// 				next: (response: ServiceResultContainer<Supplier>) => {
// 					if (response.success && response.result) {
// 						this.notificationService.toast({
// 							severity: 'success',
// 							summary: 'עודכן',
// 							detail: response.message || 'הספק עודכן בהצלחה.',
// 						});
// 						setSuppliers(
// 							suppliers.map((s) => (s.id === supplier.id ? response.result : s)),
// 						);
// 					} else {
// 						this.notificationService.toast({
// 							severity: 'error',
// 							// summary: 'שגיאה',
// 							detail: response.message || 'לא ניתן לעדכן ספק.',
// 						});
// 					}
// 				},
// 				error: () => {
// 					// טופל ב-MockDataService
// 				},
// 			});
// 		} else {
// 			this.mockDataService.addSupplier(supplier).subscribe({
// 				next: (response: ServiceResultContainer<Supplier>) => {
// 					if (response.success && response.result) {
// 						this.notificationService.toast({
// 							severity: 'success',
// 							summary: 'נוסף',
// 							detail: response.message || 'הספק נוסף בהצלחה.',
// 						});
// 						setSuppliers([...suppliers, response.result]);
// 						setPageState(PageStates.Ready);
// 					} else {
// 						this.notificationService.toast({
// 							severity: 'error',
// 							// summary: 'שגיאה',
// 							detail: response.message || 'לא ניתן להוסיף ספק.',
// 						});
// 					}
// 				},
// 				error: () => {
// 					// טופל ב-MockDataService
// 				},
// 			});
// 		}
// 	}
// }

// // private getData() {
// //     this.supplierDataService.getData(
// //       (suppliers) => this.suppliers.set(suppliers),
// //       (state) => this.pageState.set(state),
// //     );
// //   }

// //   saveSupplier(supplier: Supplier) {
// //     this.supplierDataService.saveSupplier(
// //       supplier,
// //       (suppliers) => this.suppliers.set(suppliers),
// //       this.suppliers(),
// //       (state) => this.pageState.set(state),
// //     );
// //   }

// //   private getData() {
// //     this.pageState.set(PageStates.Loading);
// //     this.mockDataService.getSuppliers().subscribe({
// //       next: (response: ServiceResultContainer<Supplier[]>) => {
// //         if (response.success && response.result) {
// //           this.suppliers.set(response.result);
// //           this.pageState.set(PageStates.Ready);
// //           console.log('Filtered suppliers:', this.filteredSuppliers());
// //         } else {
// //           this.suppliers.set([]);
// //           this.pageState.set(PageStates.Empty);
// //           this.notificationService.toast({
// //             severity: 'error',
// //             summary: 'שגיאה',
// //             detail: response.message || 'אירעה שגיאה בעת טעינת הנתונים.',
// //           });
// //         }
// //       },
// //       error: () => {
// //         this.pageState.set(PageStates.Error);
// //         this.suppliers.set([]);
// //         this.notificationService.toast({
// //           severity: 'error',
// //           summary: 'שגיאה',
// //           detail: 'אירעה שגיאה בעת טעינת הנתונים.',
// //         });
// //       },
// //     });
// //   }

// //   saveSupplier(supplier: Supplier) {
// //     if (supplier.id) {
// //       this.mockDataService.updateSupplier(supplier.id, supplier).subscribe({
// //         next: (response: ServiceResultContainer<Supplier>) => {
// //           if (response.success && response.result) {
// //             this.notificationService.toast({
// //               severity: 'success',
// //               summary: 'עודכן',
// //               detail: response.message || 'הספק עודכן בהצלחה.',
// //             });
// //             this.suppliers.set(
// //               this.suppliers().map((s) => (s.id === supplier.id ? response.result : s)),
// //             );
// //           } else {
// //             this.notificationService.toast({
// //               severity: 'error',
// //               summary: 'שגיאה',
// //               detail: response.message || 'לא ניתן לעדכן ספק.',
// //             });
// //           }
// //         },
// //         error: () => {
// //           // טופל ב-MockDataService
// //         },
// //       });
// //     } else {
// //       this.mockDataService.addSupplier(supplier).subscribe({
// //         next: (response: ServiceResultContainer<Supplier>) => {
// //           if (response.success && response.result) {
// //             this.notificationService.toast({
// //               severity: 'success',
// //               summary: 'נוסף',
// //               detail: response.message || 'הספק נוסף בהצלחה.',
// //             });
// //             this.suppliers.set([...this.suppliers(), response.result]);
// //             this.pageState.set(PageStates.Ready);
// //           } else {
// //             this.notificationService.toast({
// //               severity: 'error',
// //               summary: 'שגיאה',
// //               detail: response.message || 'לא ניתן להוסיף ספק.',
// //             });
// //           }
// //         },
// //         error: () => {
// //           // טופל ב-MockDataService
// //         },
// //       });
// //     }
// //   }
