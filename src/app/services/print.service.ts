import { Injectable } from '@angular/core';

export interface PrintConfig {
	title?: string;
	direction?: 'rtl' | 'ltr';
	styles?: string;
	pageMargin?: string;
}

export interface PrintTemplate {
	generateHtml(data: any): string;
}

@Injectable({
	providedIn: 'root'
})
export class PrintService {

	/**
	 * Print any content with custom HTML template
	 */
	printContent(htmlContent: string, config?: PrintConfig): void {
		const fullHtml = this.wrapInHtml(htmlContent, config);
		this.executePrint(fullHtml);
	}

	/**
	 * Print using a template pattern
	 */
	printWithTemplate<T>(data: T, template: PrintTemplate, config?: PrintConfig): void {
		const htmlContent = template.generateHtml(data);
		this.printContent(htmlContent, config);
	}

	/**
	 * Print simple text content
	 */
	printText(content: string, config?: PrintConfig): void {
		const htmlContent = `<div class="text-content">${content.replace(/\n/g, '<br>')}</div>`;
		this.printContent(htmlContent, config);
	}

	/**
	 * Print table data
	 */
	printTable<T extends Record<string, any>>(
		data: T[],
		columns: Array<{ key: keyof T; header: string; formatter?: (value: any) => string }>,
		config?: PrintConfig
	): void {
		const tableHtml = this.generateTable(data, columns);
		this.printContent(tableHtml, config);
	}

	private wrapInHtml(content: string, config?: PrintConfig): string {
		const direction = config?.direction || 'ltr';
		const title = config?.title || 'Print Document';
		const margin = config?.pageMargin || '20px';

		return `
      <!DOCTYPE html>
      <html lang="${direction === 'rtl' ? 'he' : 'en'}" dir="${direction}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            ${this.getBaseStyles(direction, margin)}
            ${config?.styles || ''}
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
	}

	private getBaseStyles(direction: 'rtl' | 'ltr', margin: string): string {
		const textAlign = direction === 'rtl' ? 'right' : 'left';

		return `
      * {
        box-sizing: border-box;
      }
      body { 
        font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
        direction: ${direction}; 
        text-align: ${textAlign};
        margin: ${margin};
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
      h1, h2, h3, h4, h5, h6 { 
        color: #2c3e50;
        margin: 1em 0 0.5em 0;
      }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      h4 { font-size: 16px; }
      h5 { font-size: 14px; }
      h6 { font-size: 12px; }
      p { margin: 0.5em 0; }
      ul, ol { 
        padding-${direction === 'rtl' ? 'right' : 'left'}: 20px;
        margin: 1em 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1em 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: ${textAlign};
      }
      th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      .text-content {
        white-space: pre-wrap;
      }
      .page-break {
        page-break-before: always;
      }
      @media print {
        body { 
          margin: 0;
          color: #000;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-before: always;
        }
      }
    `;
	}

	private generateTable<T extends Record<string, any>>(
		data: T[],
		columns: Array<{ key: keyof T; header: string; formatter?: (value: any) => string }>
	): string {
		if (!data.length) return '<p>No data to display</p>';

		const headerRow = columns
			.map(col => `<th>${col.header}</th>`)
			.join('');

		const bodyRows = data
			.map(row => {
				const cells = columns
					.map(col => {
						const value = row[col.key];
						const formattedValue = col.formatter ? col.formatter(value) : String(value || '');
						return `<td>${formattedValue}</td>`;
					})
					.join('');
				return `<tr>${cells}</tr>`;
			})
			.join('');

		return `
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    `;
	}

	private executePrint(printContent: string): void {
		const printFrame = document.createElement('iframe');
		printFrame.style.position = 'absolute';
		printFrame.style.top = '-9999px';
		printFrame.style.left = '-9999px';
		printFrame.style.width = '0';
		printFrame.style.height = '0';
		printFrame.style.border = 'none';

		document.body.appendChild(printFrame);

		const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
		if (frameDoc) {
			frameDoc.open();
			frameDoc.write(printContent);
			frameDoc.close();

			printFrame.onload = () => {
				setTimeout(() => {
					printFrame.contentWindow?.focus();
					printFrame.contentWindow?.print();

					setTimeout(() => {
						if (document.body.contains(printFrame)) {
							document.body.removeChild(printFrame);
						}
					}, 1000);
				}, 100);
			};
		}
	}
}

// Order-specific template implementation
export class OrderPrintTemplate implements PrintTemplate {
	generateHtml(data: any): string {
		const { supplier, date, products, notes } = data;

		const productsList = products
			?.filter((p: any) => p.quantity > 0)
			?.map((p: any) => `
        <tr>
          <td class="product-name">${p.name}</td>
          <td class="quantity">${p.quantity}</td>
        </tr>
      `)
			.join('') || '';

		const notesContent = notes?.trim() ? `
      <div class="notes-section">
        <h3>הערות:</h3>
        <div class="notes-content">${notes.replace(/\n/g, '<br>')}</div>
      </div>
    ` : '';

		return `
      <div class="order-header">
        <h1>${supplier?.name || 'ספק לא צוין'}</h1>
        <h2>תאריך הזמנה: ${date?.toLocaleDateString('he-IL') || new Date().toLocaleDateString('he-IL')}</h2>
      </div>
      
      ${productsList ? `
        <div class="products-section">
          <h3>רשימת מוצרים:</h3>
          <table class="products-table">
            <thead>
              <tr>
                <th>מוצר</th>
                <th>כמות</th>
              </tr>
            </thead>
            <tbody>
              ${productsList}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-order">לא נבחרו מוצרים להזמנה</div>
      `}
      
      ${notesContent}
      
    <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
            direction: rtl; 
            text-align: right;
            margin: 20px;
            line-height: 1.6;
            color: #333;
          }
          h1 { 
            color: #2c3e50; 
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 28px;
          }
          h2 { 
            color: #34495e; 
            font-size: 18px;
            margin: 15px 0;
          }
          h3 { 
            color: #2c3e50; 
            font-size: 16px;
            margin: 20px 0 10px 0;
          }
          ul { 
            list-style-type: none; 
            padding: 0; 
            margin: 20px 0;
            overflow: hidden;
          }
          li { 
            padding: 12px 15px; 
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #fff;
          }
          li:nth-child(even) {
            background-color: #f8f9fa;
          }
          li:last-child {
          }
          .product-name {
            font-weight: 600;
            color: #2c3e50;
          }
          .quantity {
            font-weight: bold;
            background-color: #ffeaa7;
            padding: 4px 8px;
            font-size: 14px;
          }
          .notes { 
            margin-top: 30px; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .notes h3 {
            margin-top: 0;
            color: #856404;
          }
          .notes p {
            margin-bottom: 0;
            color: #6c757d;
          }
          .empty-order {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 40px;
          }
          @media print {
            body { 
              margin: 0;
              color: #000;
            }
            h1 { 
              color: #000;
            }
            .quantity {
              background-color: transparent !important;
            }
            .notes { 
              background-color: transparent;
            }
          }
        </style>
    `;
	}
}



