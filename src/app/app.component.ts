import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, fromEvent, Subject, Subscription } from 'rxjs';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  searchText: string = "";
  productForm!: FormGroup;
  productSubject: Subject<string> = new Subject<string>();
  productSubscription: Subscription = new Subscription;
  productSearchSubscription: Subscription = new Subscription;

  // Sample JSON Data
  jsonData: Array<{ id: number, name: string, description: string }> = new Array();

  allJsonData = new Array();

  constructor(private fb: FormBuilder, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.productSearchSubscription = this.productSubject.pipe(debounceTime(800)).subscribe((res: string) => {
      this.filterData(res);
    })

    this.createForm();
    this.getJsonData();
  }

  ngOnDestroy(): void {
    this.productSubscription.unsubscribe();
    this.productSearchSubscription.unsubscribe();
  }

  public createForm() {
    this.productForm = this.fb.group({
      product: this.fb.array([])
    })
  }

  public get products(): FormArray {
    return this.productForm.get('product') as FormArray;
  }

  public loadJsonData() {
    this.jsonData.forEach((product: { id: number, name: string, description: string }) => {
      this.products.push(this.fb.group({
        id: [product.id],
        name: [product.name],
        description: [product.description]
      }));
    });
  }

  public addProducts() {
    this.products.push(this.fb.group({
      id: [null],
      name: [""],
      description: [""]
    }));
  }

  public removeProducts(index: number) {
    this.products.removeAt(index)
  }

  public submitForm() {

  }

  public filterData(str: string) {
    this.jsonData = this.allJsonData.filter(el => el.name.toLowerCase().includes(str.toLowerCase()) || el.description.toLowerCase().includes(str.toLowerCase()));
    this.products.clear();
    this.loadJsonData();
  }

  public getJsonData() {
    this.productSubscription = this.httpClient.get<{ id: number, name: string, description: string }[]>('assets/product.json')
      .subscribe({
        next: (response) => {
          this.jsonData = response;
          this.allJsonData = JSON.parse(JSON.stringify(response));
          this.loadJsonData();
        },
        error: (err) => console.error('Error fetching products:', err)
      });
  }
}
