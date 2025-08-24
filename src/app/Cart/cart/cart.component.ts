import { cartItem, CheckoutRequest } from './../../Interfaces/cartItems';
import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/Interfaces/Product';
import { CartserviceService } from 'src/app/Service/cartservice.service';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';
import { loadStripe } from '@stripe/stripe-js';
import { Router } from '@angular/router';
import { Cart } from 'src/app/Interfaces/Carts';
import { DescriptionService } from 'src/app/Service/description.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  CartItems: Product[] = [];
  private stripe: any;
  private cartKey = 'CartItems';

  constructor(
    private CartSer: CartserviceService,
    private UserAuth: UserAuthenticationService,
    private service: ServiceService,
    private router: Router,
    private DescriptionSer: DescriptionService
  ) {}

  ngOnInit(): void {
    window.scroll({top : 0, behavior : 'smooth'})
    this.loadCart();
    this.stripe = loadStripe('pk_test_51Q14ZPLUegd08TjlSIsNCpa5M0w2SXWhy55RsJpCwTSmdf7gekd5rKqw6WAKk7jmFgHclkLjhMqDN9IjiQhGVgPT001SajDZgb');  
  }

  loadCart() {
    if (this.UserAuth.UserAuthenticate()) {
      this.CartSer.GetServerCart().subscribe({
        next: (cart: Cart) => {
          this.CartItems = cart.cartItems.map(ci => ({
            ...ci.products,
            quantity: ci.quantity,
            selectedSize : ci.size,
            imageUrl: `${environment.apiUrl.replace('/api','')}/${ci.products.imageUrl}`
          }));
          this.CartSer.updateCartCount().subscribe();
        },
        error: () => alert('Failed to load server cart.')
      });
    } else {
      this.CartItems = this.CartSer.getLocalItems();
      this.CartSer.updateCartCount().subscribe();
    }
  }

  removeFromCart(productid: number,size : string) {
    this.CartSer.removeFromCart(productid,size).subscribe(() => {
      this.loadCart();
      this.CartSer.updateCartCount().subscribe();
    });
  }

  getTotal(): number {
    return this.CartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async checkout() {
    if (this.CartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Map cart items into the required format
    const cartItemsForCheckout: cartItem[] = this.CartItems.map(item => ({
      Productid: item.id,
      Name: item.name,
      Quantity: item.quantity,
      Price: item.price,
      Size : item.selectedSize,
      ImageUrl: item.imageUrl
    }));

    const decoded: any = this.UserAuth.decoded(this.UserAuth.GetToken());
    const userId = Number(decoded?.sub);  // Ensure userId is a number

    if (!userId || isNaN(userId)) {
      alert('Please log in first');
      this.router.navigate(['/login']);
      return;
    }

    const checkoutRequest: CheckoutRequest = {
      UserId: userId,
      CartItems: cartItemsForCheckout
    };

    console.log('Checkout Request:', checkoutRequest);

    this.service.CheckoutCreateSession(checkoutRequest).subscribe(
      async (res) => {
        const stripe = await this.stripe;
        await stripe.redirectToCheckout({ sessionId: res.sessionId });
      },
      err => {
        console.error('Checkout error:', err);
        alert('Checkout failed: ' + (err.error?.message || err.statusText || 'Unknown error'));
      }
    );
  }

addQuantityCart(productid: number, size: string) {
  const item = this.CartItems.find(item => item.id === productid && item.selectedSize === size);
  if (item) {
    if (this.UserAuth.UserAuthenticate()) {
      // Authenticated user logic (server-side check)
      this.CartSer.Increaseproductserver(productid, size).subscribe(() => {
        this.loadCart();
        this.CartSer.updateCartCount().subscribe();
      });
    } else {
     this.CartSer.getProductStock(productid).subscribe({
  next: (stock) => {
    const totalQuantity = this.CartItems
      .filter(ci => ci.id === productid)
      .reduce((sum, ci) => sum + ci.quantity, 0); // ✅ total across all sizes

    if (totalQuantity + 1 > stock) {
      alert('Sorry, cannot add more. Total quantity exceeds available stock.');
    } else {
      item.quantity++;
      localStorage.setItem(this.cartKey, JSON.stringify(this.CartItems));
      this.loadCart();
      this.CartSer.updateCartCount().subscribe();
    }
  }
});

    }
  }
}

  decreaseQuantityCart(productid: number,size : string) {
    const product = this.CartItems.find(p => p.id === productid);
    if (product) {
      if (this.UserAuth.UserAuthenticate()) {
        this.CartSer.decreaseproductserver(productid,size).subscribe(() => {
          this.loadCart();
          this.CartSer.updateCartCount().subscribe();
        });
      } else{
        const productguest = this.CartItems.find(pc=>pc.id === productid && pc.selectedSize === size)
        if(productguest){
          if(productguest.quantity > 1){
            productguest.quantity--;
          }
          else if(productguest.quantity-1==0){
            this.CartItems = this.CartItems.filter(p=>!(p.id===productid && p.selectedSize===size));
          }
          localStorage.setItem(this.cartKey, JSON.stringify(this.CartItems));
          this.loadCart();
          this.CartSer.updateCartCount().subscribe();
        } 
      }
    }
  }

  productdescription(product: Product) {
    this.DescriptionSer.SetProductDescription(product);
    this.router.navigate(['/product-description']);
  }
}
