import { Injectable } from '@angular/core';
import { Product } from '../Interfaces/Product';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserAuthenticationService } from './user-authentication.service';
import { Cart } from '../Interfaces/Carts';

@Injectable({
  providedIn: 'root'
})
export class CartserviceService {
  private CartItems = new BehaviorSubject<number>(0);
  cartitem$ = this.CartItems.asObservable();

  private cartKey = 'CartItems';
  private CartApi = 'https://localhost:7280/api/cart';
  private ProductQuantityApi = 'https://localhost:7280/api/products';

  constructor(
    private http: HttpClient,
    private userAuth: UserAuthenticationService
  ) {
    this.updateCartCount();
  }

  // Remove item from cart
 removeFromCart(productid: number, size: string): Observable<any> {
  if (this.userAuth.UserAuthenticate()) {
    return this.removeServerCart(productid, size).pipe(
      tap(() => this.updateCartCount())
    );
  } else {
    const cart = this.getLocalItems().filter(p => !(p.id === productid && p.selectedSize === size));
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.updateCartCount();
    return of(true);
  }
}

  // Get local cart items for guests
  getLocalItems(): Product[] {
    const cart = localStorage.getItem(this.cartKey);
    return cart ? JSON.parse(cart) : [];
  }
  ResetCart(){
    localStorage.removeItem(this.cartKey);
    this.CartItems.next(0)
  }

  // Add to cart
  addToCart(product: Product) : Observable<any> {
  if (this.userAuth.UserAuthenticate()) {
    // Your existing server logic (no change)
    return this.addServerCart(product.id, product.quantity, product.selectedSize).pipe(
      tap(() => this.updateCartCount()),
      catchError(err => {
        if (err.status === 404 && err.error) {
          alert(err.error);
        } else {
          alert('Unexpected error occurred');
        }
        return of(false);
      })
    );
  } else {
    // Guest user localStorage logic
    return this.getProductStock(product.id).pipe(
      map((stock: number) => {
        const cart = this.getLocalItems();

        // Calculate total quantity of the product across all sizes in the cart
        const totalQuantity = cart
          .filter(p => p.id === product.id)
          .reduce((sum, p) => sum + p.quantity, 0);

        if (totalQuantity + 1 > stock) {
          alert('Sorry, Not Enough Quantity across all sizes');
          return false;
        }

        // Find item with the same size
        const existingItem = cart.find(p => p.id === product.id && p.selectedSize === product.selectedSize);

        if (existingItem) {
          existingItem.quantity++;
        } else {
          product.quantity = 1;
          cart.push(product);
        }

        localStorage.setItem(this.cartKey, JSON.stringify(cart));
        this.updateCartCount();
        return true;
      })
    );
  }
}
  updateCartCount() : Observable<any> {
    if (this.userAuth.UserAuthenticate()) {
    return  this.GetServerCart().pipe(
      tap(cart => {
        const total = cart.cartItems.reduce((sum,item)=>sum+item.quantity,0)
        this.CartItems.next(total)
      }),
    )
    } else {
      const total = this.getLocalItems().reduce((sum, item) => sum + item.quantity, 0);
      this.CartItems.next(total);
    }
    return of(true)
  }

  // Get server cart for logged-in users
  GetServerCart(): Observable<Cart> {
    return this.http.get<Cart>(this.CartApi, {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    });
  }

  // Add item to server cart
  addServerCart(productId: number,quantity:number,size:string): Observable<any> {
    return this.http.post<Cart>(
      `${this.CartApi}/AddToCart`,
      {productId,quantity,size}, // Notice PascalCase keys
      {
        headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
      }
    );
  }

  // Remove item from server cart
 removeServerCart(productId: number, size: string): Observable<any> {
  const removeRequest = { productId, size };
  return this.http.post(
    `${this.CartApi}/remove/${productId}`, 
    removeRequest,
    {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    }
  );
}

  getProductStock(productid : number) :Observable<number>{
    return this.http.get<number>(`${this.ProductQuantityApi}/product-stock/${productid}`)
  }
  decreaseproductserver(productid : number,size : string) :Observable<any>{
    const decreaseRequest = {productid,size}
    return this.http.patch(`${this.CartApi}/productquantity/${productid}`,decreaseRequest,{
      headers :{ 'Authorization': `Bearer ${this.userAuth.GetToken()}`}
    })
  }
  Increaseproductserver(productid : number,size : string) :Observable<any>{
    const decreaseRequest = {productid,size}
    return this.http.patch(`${this.CartApi}/addproductquantity/${productid}`,decreaseRequest,{
      headers :{ 'Authorization': `Bearer ${this.userAuth.GetToken()}`}
    })
  }

}
