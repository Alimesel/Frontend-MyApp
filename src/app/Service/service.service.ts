import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { LoginUser, UserDTO } from '../Interfaces/User';
import { Category, Product } from '../Interfaces/Product';
import { WishList } from '../Interfaces/WishList';
import { UserAuthenticationService } from './user-authentication.service';
import { Orders } from '../Interfaces/Orders';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private LoginAPI = `${environment.apiUrl}/users/Login`;
  private RegisterAPI = `${environment.apiUrl}/users/Register`;
  private profileup = `${environment.apiUrl}/users/update`;
  private ProductsAPI = `${environment.apiUrl}/products/products`;
  private CategoryAPI = `${environment.apiUrl}/products/category`;
  private WishListAPI = `${environment.apiUrl}/Wish`;
  private CheckoutAPI = `${environment.apiUrl}/checkout`;
  private HomeApi = `${environment.apiUrl}/home/home-info`;

  constructor(private http: HttpClient, private UserAuth: UserAuthenticationService) { }

  UserLogin(user: LoginUser): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.LoginAPI, user);
  }

  UserRegister(user: UserDTO): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.RegisterAPI, user);
  }

  GetProducts(categoryid?: number, searchTerm?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryid) params = params.set("categoryid", categoryid.toString());
    if (searchTerm) params = params.set("searchTerm", searchTerm);
    return this.http.get<Product[]>(this.ProductsAPI, { params });
  }

  GetCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.CategoryAPI);
  }

  ProfileUpdate(User: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(this.profileup, User);
  }

  AddToWishList(productId: number): Observable<any> {
    return this.http.post(`${this.WishListAPI}/AddProductToWishList`, productId, {
      headers: { 'Authorization': `Bearer ${this.UserAuth.GetToken()}` }
    });
  }

  GetWishListItems(): Observable<WishList> {
    return this.http.get<WishList>(`${this.WishListAPI}/WishListProducts`, {
      headers: { 'Authorization': `Bearer ${this.UserAuth.GetToken()}` }
    });
  }

  DeleteItemFromWish(productId: number): Observable<any> {
    return this.http.delete(`${this.WishListAPI}/RemoveProductFromWishList`, {
      headers: { 'Authorization': `Bearer ${this.UserAuth.GetToken()}` },
      body: productId
    });
  }

  CheckoutCreateSession(checkoutRequest: any): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(`${this.CheckoutAPI}/create-session`, checkoutRequest);
  }

  OrderHistory(): Observable<Orders> {
    return this.http.get<Orders>(`${this.CheckoutAPI}/Get-Order-history`, {
      headers: { 'Authorization': `Bearer ${this.UserAuth.GetToken()}` }
    });
  }

  GetHomeSections(): Observable<any> {
    return this.http.get<any>(`${this.HomeApi}`);
  }
}
