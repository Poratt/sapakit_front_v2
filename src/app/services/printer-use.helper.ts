// import { PrintService, OrderPrintTemplate, PrintConfig } from './print.service';

// export class ExampleComponent {
  
//   constructor(private printService: PrintService) {}

//   // 1. הדפסת הזמנה עם template מותאם אישית
//   printOrder(): void {
//     const orderData = {
//       supplier: this.supplier,
//       date: this.date,
//       products: this.availableProducts()
//         .filter(p => this.getProductQuantity(p.id) > 0)
//         .map(p => ({
//           id: p.id,
//           name: p.name,
//           quantity: this.getProductQuantity(p.id)
//         })),
//       notes: this.notes()
//     };

//     const config: PrintConfig = {
//       title: `הזמנה - ${this.supplier?.name}`,
//       direction: 'rtl'
//     };

//     this.printService.printWithTemplate(orderData, new OrderPrintTemplate(), config);
//   }

//   // 2. הדפסת טבלה גנרית
//   printProductsTable(): void {
//     const products = this.availableProducts();
//     const columns = [
//       { key: 'name' as keyof typeof products[0], header: 'שם מוצר' },
//       { key: 'cost' as keyof typeof products[0], header: 'מחיר', formatter: (cost: number) => `₪${cost}` },
//       { key: 'category' as keyof typeof products[0], header: 'קטגוריה' }
//     ];

//     this.printService.printTable(products, columns, {
//       title: 'רשימת מוצרים',
//       direction: 'rtl'
//     });
//   }

//   // 3. הדפסת טקסט פשוט
//   printNotes(): void {
//     this.printService.printText(this.notes(), {
//       title: 'הערות',
//       direction: 'rtl',
//       styles: `
//         .text-content {
//           background-color: #f8f9fa;
//           padding: 20px;
//           border-radius: 8px;
//           border-right: 4px solid #007bff;
//         }
//       `
//     });
//   }

//   // 4. הדפסת HTML מותאם אישית
//   printCustomContent(): void {
//     const customHtml = `
//       <div class="custom-report">
//         <h1>דו"ח יומי</h1>
//         <div class="stats">
//           <div class="stat-item">
//             <h3>סה"כ הזמנות</h3>
//             <span class="number">${this.getTotalOrders()}</span>
//           </div>
//           <div class="stat-item">
//             <h3>סה"כ מוצרים</h3>
//             <span class="number">${this.getTotalProducts()}</span>
//           </div>
//         </div>
//       </div>
//     `;

//     const customStyles = `
//       .custom-report {
//         text-align: center;
//       }
//       .stats {
//         display: flex;
//         justify-content: space-around;
//         margin: 20px 0;
//       }
//       .stat-item {
//         background: #f8f9fa;
//         padding: 20px;
//         border-radius: 8px;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//       }
//       .number {
//         font-size: 2em;
//         font-weight: bold;
//         color: #007bff;
//       }
//     `;

//     this.printService.printContent(customHtml, {
//       title: 'דו"ח יומי',
//       direction: 'rtl',
//       styles: customStyles
//     });
//   }

//   // Helper methods (example)
//   private getTotalOrders(): number { return 42; }
//   private getTotalProducts(): number { return 150; }
// }

// // דוגמה ל-template נוסף
// export class InvoicePrintTemplate implements PrintTemplate {
//   generateHtml(data: any): string {
//     const { customer, items, total, invoiceNumber, date } = data;
    
//     return `
//       <div class="invoice">
//         <header class="invoice-header">
//           <h1>חשבונית מס' ${invoiceNumber}</h1>
//           <div class="date">תאריך: ${date}</div>
//         </header>
        
//         <div class="customer-info">
//           <h2>פרטי לקוח:</h2>
//           <p>${customer.name}</p>
//           <p>${customer.address}</p>
//         </div>
        
//         <table class="items-table">
//           <thead>
//             <tr>
//               <th>תיאור</th>
//               <th>כמות</th>
//               <th>מחיר יחידה</th>
//               <th>סה"כ</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${items.map((item: any) => `
//               <tr>
//                 <td>${item.description}</td>
//                 <td>${item.quantity}</td>
//                 <td>₪${item.cost}</td>
//                 <td>₪${item.quantity * item.cost}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//         </table>
        
//         <div class="total-section">
//           <h3>סה"כ לתשלום: ₪${total}</h3>
//         </div>
//       </div>
      
//       <style>
//         .invoice {
//           max-width: 800px;
//           margin: 0 auto;
//         }
//         .invoice-header {
//           text-align: center;
//           border-bottom: 2px solid #333;
//           padding-bottom: 20px;
//           margin-bottom: 30px;
//         }
//         .customer-info {
//           background: #f8f9fa;
//           padding: 15px;
//           border-radius: 5px;
//           margin-bottom: 30px;
//         }
//         .items-table {
//           margin-bottom: 30px;
//         }
//         .total-section {
//           text-align: left;
//           font-size: 1.2em;
//           border-top: 2px solid #333;
//           padding-top: 20px;
//         }
//       </style>
//     `;
//   }
// }