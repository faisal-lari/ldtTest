import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { HttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [AppComponent],
      providers: [{ provide: HttpClient, useValue: httpClientSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form correctly', () => {
    component.createForm();
    expect(component.productForm.contains('product')).toBeTrue();
    expect(component.products.length).toBe(0);
  });

  it('should fetch and load JSON data', () => {
    const mockData = [
      { id: 1, name: 'Product A', description: 'Description A' },
      { id: 2, name: 'Product B', description: 'Description B' }
    ];

    httpClientSpy.get.and.returnValue(of(mockData));

    component.getJsonData();
    expect(component.jsonData.length).toBe(2);
    expect(component.allJsonData.length).toBe(2);
    expect(component.products.length).toBe(2);
  });

  it('should add a new row', () => {
    component.addRow();
    expect(component.products.length).toBe(1);
    expect(component.jsonData.length).toBe(1);
  });

  it('should remove a row', () => {
    component.addRow();
    expect(component.products.length).toBe(1);

    component.removeProducts(0);
    expect(component.products.length).toBe(0);
  });

  it('should submit form data', () => {
    component.addRow();
    component.products.at(0).patchValue({ id: 1, name: 'Test', description: 'Test Desc' });

    component.submitForm();
    expect(component.jsonData.length).toBe(1);
    expect(component.jsonData[0].name).toBe('Test');
  });

  it('should filter data correctly', fakeAsync(() => {
    component.allJsonData = [
      { id: 1, name: 'Apple', description: 'Fruit' },
      { id: 2, name: 'Banana', description: 'Yellow Fruit' }
    ];

    component.filterData('Apple');
    tick(800); // Simulate debounceTime

    expect(component.jsonData.length).toBe(1);
    expect(component.jsonData[0].name).toBe('Apple');
  }));

  it('should unsubscribe from subscriptions on destroy', () => {
    spyOn(component.productSubscription, 'unsubscribe');
    spyOn(component.productSearchSubscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(component.productSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.productSearchSubscription.unsubscribe).toHaveBeenCalled();
  });
});
