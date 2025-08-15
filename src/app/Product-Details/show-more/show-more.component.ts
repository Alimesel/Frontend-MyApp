import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Product, Category } from './../../Interfaces/Product';

import { CartserviceService } from 'src/app/Service/cartservice.service';
import { DescriptionService } from 'src/app/Service/description.service';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';

@Component({
  selector: 'app-show-more',
  templateUrl: './show-more.component.html',
  styleUrls: ['./show-more.component.css']
})
export class ShowMoreComponent implements OnInit {
  

  Product: Product = {
    id: 1,
    name: '',
    price: 0,
    quantity: 0,
    description: '',
    imageUrl: '',
    selectedSize : '',
    category: {
      id: 0, name: '',
      image: '',
    
    }
  };
  sizeOptions : string [] = []
  
  RelatedProducts: Product[] = [];

  constructor(
    private DescriptionSer: DescriptionService,
    private CartSer: CartserviceService,
    private router: Router,
    private UserAuth: UserAuthenticationService,
    private Service: ServiceService
  ) {}

  ngOnInit(): void {
    this.Product = this.DescriptionSer.GetProductDescription();
    setTimeout(()=> this.ScrollUp(),10)
    this.DescriptionSer.description$.subscribe(result => {
      if (result) {
        this.Product = result;
        console.log(this.Product)
        this.GetProductsByCategory();
        // Delay scroll to ensure the view is ready
        setTimeout(() => this.ScrollUp(),100);
      }
    });
    this.GetProductsByCategory();

    if (this.Product.category?.id === 1 || this.Product.category?.id === 3) {
      this.sizeOptions = ['S', 'M', 'L', 'XL','XXL'];
    } else if (this.Product.category?.id === 2) {
      this.sizeOptions = ["38", "39", "40", "41", "42"];
    }
  }

  addToCart(product: Product) {
  if(!product.selectedSize){
    alert('Please select a size')
    return
  }
  this.CartSer.addToCart(product).subscribe(()=>{
    this.router.navigate(['/cart'])
  });
  }
 selectSize(size : string){
  this.Product.selectedSize = size;
  console.log(this.Product.selectedSize)
 }
  goBack() {
    this.router.navigate(['/home']);
  }

   addToWishlist(productId: number) {
  if (this.UserAuth.UserAuthenticate()) {
    this.Service.AddToWishList(productId).subscribe({
      next: (data: any) => {
        this.router.navigate(['/wish']);
      },
      error: (error) => {
        if (error.status === 400) {
          alert("Product already in the wishlist.");
          this.router.navigate(['/wish']);
        } 
        }
    });
  } else {
    alert("Please log in first to add to the wishlist.");
    this.router.navigate(['/login']);
  }
}

  GetProductsByCategory() {
    let categoryid = this.Product.category.id;
    this.Service.GetProducts(categoryid).subscribe({
      next: data => {
        this.RelatedProducts = data.filter(eachproduct => eachproduct.id !== this.Product.id)
          .map(eachproduct => ({
            ...eachproduct,
            imageUrl: `https://localhost:7280/${eachproduct.imageUrl}`,
          }));
      }
    });
  }

  showMoreProducts(product: Product) {
    console.log('Selected Product for Details:', product);
    this.DescriptionSer.SetProductDescription(product);
    this.router.navigate(['/product-description']);
  }

 ScrollUp(){
  window.scrollTo({top: 0, behavior: 'smooth'});
 }
}
