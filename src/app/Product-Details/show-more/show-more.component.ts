import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './../../Interfaces/Product';
import { environment } from 'src/environments/environment.prod';
import { CartserviceService } from 'src/app/Service/cartservice.service';
import { DescriptionService } from 'src/app/Service/description.service';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    selectedSize: '',
    category: { id: 0, name: '', image: '' }
  };

  sizeOptions: string[] = [];
  RelatedProducts: Product[] = [];

  constructor(
    private DescriptionSer: DescriptionService,
    private CartSer: CartserviceService,
    private router: Router,
    private UserAuth: UserAuthenticationService,
    private Service: ServiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.Product = this.DescriptionSer.GetProductDescription();
    setTimeout(() => this.ScrollUp(), 10);

    this.DescriptionSer.description$.subscribe(result => {
      if (result) {
        this.Product = result;
        this.GetProductsByCategory();
        setTimeout(() => this.ScrollUp(), 100);
      }
    });

    this.GetProductsByCategory();

    // Assign size options by category
    if (this.Product.category?.id === 1 || this.Product.category?.id === 3) {
      this.sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
    } else if (this.Product.category?.id === 2) {
      this.sizeOptions = ["38", "39", "40", "41", "42"];
    }
  }

  // ---------------------- TOASTS ----------------------
  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    let panelClass = '';
    switch(type) {
      case 'success': panelClass = 'toast-success'; break;
      case 'error': panelClass = 'toast-error'; break;
      case 'warning': panelClass = 'toast-warning'; break;
      case 'info': panelClass = 'toast-info'; break;
    }

    this.snackBar.open(message, '✖', {
      duration: 4000,
      panelClass: [panelClass],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  addToCart(product: Product) {
    if (!product.selectedSize) {
      this.showToast('Please select a size before adding to the cart.', 'warning');
      return;
    }
    this.CartSer.addToCart(product).subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }

  selectSize(size: string) {
    this.Product.selectedSize = size;

  }

  goBack() {
    this.router.navigate(['/home']);
  }

  addToWishlist(productId: number) {
    if (!this.UserAuth.UserAuthenticate()) {
      this.showToast('Please log in first to add products to your wishlist.', 'info');
      return;
    }

    this.Service.AddToWishList(productId).subscribe({
      next: () =>{ this.router.navigate(['/wish'])},
      error: (error) => {
        if (error.status === 400) {
          this.showToast('This product is already in your wishlist.', 'warning');
        } else {
          this.showToast('Failed to add product to wishlist. Try again later.', 'error');
        }
      }
    });
  }

  GetProductsByCategory() {
    let categoryid = this.Product.category.id;
    this.Service.GetProducts(categoryid).subscribe({
      next: data => {
        this.RelatedProducts = data.filter(each => each.id !== this.Product.id)
          .map(each => ({
            ...each,
            imageUrl: `${environment.apiUrl.replace('/api','')}/${each.imageUrl}`,
          }));
      }
    });
  }

  showMoreProducts(product: Product) {
    this.DescriptionSer.SetProductDescription(product);
    this.router.navigate(['/product-description']);
  }

  ScrollUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
