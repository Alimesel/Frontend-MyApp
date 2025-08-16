import { Injectable } from '@angular/core';
import { Product } from '../Interfaces/Product';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserAuthenticationService } from './user-authentication.service';
import { Cart } from '../Interfaces/Carts';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CartserviceService {
  private CartItems = new BehaviorSubject<number>(0);
  cartitem$ = this.CartItems.asObservable();

  private cartKey = 'CartItems';
  private CartApi = `${environment.apiUrl}/cart`;
  private ProductQuantityApi = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient,
    private userAuth: UserAuthenticationService
  ) {
    this.updateCartCount();
  }

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

  getLocalItems(): Product[] {
    const cart = localStorage.getItem(this.cartKey);
    return cart ? JSON.parse(cart) : [];
  }

  ResetCart(){
    localStorage.removeItem(this.cartKey);
    this.CartItems.next(0);
  }

  addToCart(product: Product): Observable<any> {
    if (this.userAuth.UserAuthenticate()) {
      return this.addServerCart(product.id, product.quantity, product.selectedSize).pipe(
        tap(() => this.updateCartCount()),
        catchError(err => {
          alert(err.status === 404 && err.error ? err.error : 'Unexpected error occurred');
          return of(false);
        })
      );
    } else {
      return this.getProductStock(product.id).pipe(
        map(stock => {
          const cart = this.getLocalItems();
          const totalQuantity = cart.filter(p => p.id === product.id).reduce((sum, p) => sum + p.quantity, 0);
          if (totalQuantity + 1 > stock) { alert('Not enough quantity'); return false; }
          const existingItem = cart.find(p => p.id === product.id && p.selectedSize === product.selectedSize);
          if (existingItem) existingItem.quantity++;
          else { product.quantity = 1; cart.push(product); }
          localStorage.setItem(this.cartKey, JSON.stringify(cart));
          this.updateCartCount();
          return true;
        })
      );
    }
  }

  updateCartCount(): Observable<any> {
    if (this.userAuth.UserAuthenticate()) {
      return this.GetServerCart().pipe(
        tap(cart => {
          const total = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
          this.CartItems.next(total);
        })
      );
    } else {
      this.CartItems.next(this.getLocalItems().reduce((sum, item) => sum + item.quantity, 0));
      return of(true);
    }
  }

  GetServerCart(): Observable<Cart> {
    return this.http.get<Cart>(this.CartApi, {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    });
  }

  addServerCart(productId: number, quantity: number, size: string): Observable<any> {
    return this.http.post<Cart>(`${this.CartApi}/AddToCart`, { productId, quantity, size }, {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    });
  }

  removeServerCart(productId: number, size: string): Observable<any> {
    return this.http.post(`${this.CartApi}/remove/${productId}`, { productId, size }, {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    });
  }

  getProductStock(productid: number): Observable<number> {
    return this.http.get<number>(`${this.ProductQuantityApi}/product-stock/${productid}`);
  }

  decreaseproductserver(productid: number, size: string): Observable<any> {
    return this.http.patch(`${this.CartApi}/productquantity/${productid}`, { productid, size }, {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    });
  }

  Increaseproductserver(productid: number, size: string): Observable<any> {
    return this.http.patch(`${this.CartApi}/addproductquantity/${productid}`, { productid, size }, {
      headers: { 'Authorization': `Bearer ${this.userAuth.GetToken()}` }
    });
  }
}
