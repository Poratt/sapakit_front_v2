import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplierComponent, CategoryGroup } from './supplier.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Product } from '../../../models/product';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { Package } from '../../../common/enums/package';
import { Status } from '../../../common/enums/status.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ServiceResultContainer } from '../../../models/serviceResultContainer';
import { ActivatedRoute } from '@angular/router';

const mockActivatedRoute = {
	paramMap: of({
		get: (key: string) => '1'
	})
}; function createMockProduct(
	overrides: Partial<Product> = {}
): Product {
	const base: Product = {
		id: 1,
		name: 'Mock',
		categoryId: 10,
		categoryName: 'Cat1',
		position: 0,
		package: Package.Unit,
		cost: 1,
		quantity: 1,
		status: Status.Active,
		imageUrl: '',
		supplierId: 1,
		comment: '',
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date()
	};
	return { ...base, ...overrides };
}

describe('SupplierComponent', () => {
	let component: SupplierComponent;
	let fixture: ComponentFixture<SupplierComponent>;
	let apiServiceSpy: jasmine.SpyObj<ApiService>;

	beforeEach(async () => {
		const mockProduct = createMockProduct({ id: 99 });
		const response: ServiceResultContainer<Product> = {
			success: true,
			message: 'OK',
			result: mockProduct
		};


		apiServiceSpy = jasmine.createSpyObj('ApiService', ['updateProduct']);
		apiServiceSpy.updateProduct.and.returnValue(of(response));

		await TestBed.configureTestingModule({
			imports: [
				SupplierComponent,
			],
			providers: [
				{ provide: ApiService, useValue: apiServiceSpy },
				{ provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['toast']) },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('dropCategory → batchUpdateProducts עם מיקומים חדשים', () => {
		// Arrange
		const a = createMockProduct({ id: 1, position: 0, categoryId: 10, categoryName: 'Cat1' });
		const b = createMockProduct({ id: 2, position: 0, categoryId: 20, categoryName: 'Cat2' });
		component['rawProducts'].set([a, b]);
		component['categories'].set([a, b]);

		spyOn(component as any, 'batchUpdateProducts');

		const event: CdkDragDrop<CategoryGroup[], CategoryGroup[], CategoryGroup> = {
			previousIndex: 0,
			currentIndex: 1,
			previousContainer: { id: 'catList', data: component.groupedProducts(), element: {} as any } as any,
			container: { id: 'catList', data: component.groupedProducts(), element: {} as any } as any,
			item: {} as any,
			isPointerOverContainer: true,
			distance: { x: 0, y: 0 },
			dropPoint: { x: 100, y: 100 },
			event: new MouseEvent('drop'),
		};

		// Act
		component.dropCategory(event);

		// Assert
		const spy = (component as any).batchUpdateProducts;
		expect(spy).toHaveBeenCalled();
		const map: Map<number, Partial<Product>> = spy.calls.mostRecent().args[0];
		expect(map.get(1)).toEqual({ position: 1 }); // moved למטה
		expect(map.get(2)).toEqual({ position: 0 }); // moved למעלה
	});

	it('dropProduct → batchUpdateProducts עם שינוי קטגוריה + מיקומים', () => {
		// Arrange
		const a = createMockProduct({ id: 1, position: 0, categoryId: 10, categoryName: 'Cat1' });
		const b = createMockProduct({ id: 2, position: 0, categoryId: 20, categoryName: 'Cat2' });

		component['rawProducts'].set([a, b]);
		component['categories'].set([a, b]);

		spyOn(component as any, 'batchUpdateProducts');

		// המצב הראשוני:
		// previousContainer.data = [a] (Cat1)
		// container.data = [b] (Cat2)
		// אחרי transferArrayItem(previousContainer.data, container.data, 0, 1):
		// previousContainer.data = [] (a הוצא)
		// container.data = [b, a] (a נכנס למיקום 1)

		const previousContainer = { id: 'cat1', data: [a], element: {} as any } as any;
		const container = { id: 'cat2', data: [b], element: {} as any } as any;

		const event: CdkDragDrop<Product[], Product[], Product> = {
			previousIndex: 0,
			currentIndex: 1,
			previousContainer: previousContainer,
			container: container,
			item: {} as any,
			isPointerOverContainer: true,
			distance: { x: 0, y: 0 },
			dropPoint: { x: 100, y: 100 },
			event: new MouseEvent('drop'),
		};

		// Act
		component.dropProduct(event);

		// console.log('After drop:');
		// console.log('previousContainer.data:', previousContainer.data);
		// console.log('container.data:', container.data);

		// Assert
		const map: Map<number, Partial<Product>> =
			(component as any).batchUpdateProducts.calls.mostRecent().args[0];

		// console.log('Updates map:');
		// console.log('Product 1 update:', map.get(1));
		// console.log('Product 2 update:', map.get(2));

		expect(map.get(1)).toEqual(jasmine.objectContaining({
			categoryId: 20,
			categoryName: 'Cat2',
			position: 1
		}));

		expect(map.get(2)).toEqual(jasmine.objectContaining({ position: 0 }));
	});
});

function createMockDragDropEvent<T>(config: Partial<CdkDragDrop<T[]>>): CdkDragDrop<T[]> {
	const baseEvent: CdkDragDrop<T[]> = {
		previousIndex: 0,
		currentIndex: 0,
		container: {} as any,
		previousContainer: {} as any,
		item: {} as any,
		isPointerOverContainer: true,
		distance: { x: 0, y: 0 },
		dropPoint: { x: 0, y: 0 },
		event: new MouseEvent('drop'),
	};
	return { ...baseEvent, ...config };
}