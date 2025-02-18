import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  //Global Properties
  searchText: string = "";
  productForm!: FormGroup;
  productSubject: Subject<string> = new Subject<string>();
  productSubscription: Subscription = new Subscription;
  productSearchSubscription: Subscription = new Subscription;

  // Sample JSON Data
  jsonData: Array<{ id: number | null, name: string, description: string }> = new Array();
  allJsonData = new Array();

  constructor(private fb: FormBuilder, private httpClient: HttpClient) { }

  ngOnInit(): void {

    //debounce logic
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

  //form creation
  public createForm() {
    this.productForm = this.fb.group({
      product: this.fb.array([])
    })
  }

  public get products(): FormArray {
    return this.productForm.get('product') as FormArray;
  }

  public loadJsonData() {
    this.jsonData.forEach((product: { id: number | null, name: string, description: string }) => {
      this.products.push(this.fb.group({
        id: [product.id],
        name: [product.name],
        description: [product.description]
      }));
    });
  }

  public addRow() {
    const newProduct = this.fb.group({
      id: [null],
      name: [""],
      description: [""]
    });

    this.products.push(newProduct);
    this.jsonData.push({ id: null, name: "", description: "" });
    this.allJsonData = [...this.jsonData];
  }

  public removeProducts(index: number) {
    this.products.removeAt(index)
  }

  public submitForm() {
    if (this.productForm.valid) {
      this.jsonData = this.productForm.value.product;
      this.allJsonData = [...this.jsonData]; // Updating the backup data
      console.log("Submitted Data:", this.jsonData);
    } else {
      console.error("Form is invalid. Please fill in required fields.");
    }
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
