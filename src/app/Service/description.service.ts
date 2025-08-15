import { Injectable } from '@angular/core';
import { Product } from '../Interfaces/Product';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DescriptionService  {
private DescriptionDetails = new BehaviorSubject<Product | null>(null);
description$ = this.DescriptionDetails.asObservable();
  constructor() { }
  SetProductDescription(product  :any){
    localStorage.setItem('description', JSON.stringify(product));
    this.DescriptionDetails.next(product);
  }
  GetProductDescription()  :Product{
    return JSON.parse(localStorage.getItem('description') || '[]');
  }
}
