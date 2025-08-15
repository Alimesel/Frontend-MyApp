import { WishList} from './../Interfaces/WishList';
  import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { LoginUser, UserDTO, UserAuthenticaion } from '../Interfaces/User';
  import { catchError, Observable, throwError } from 'rxjs';
  import {  Category, Product } from '../Interfaces/Product';
import { MessageResponse } from '../Interfaces/MessageResponse';
import { cartItem, CheckoutRequest, } from '../Interfaces/cartItems';
import { UserAuthenticationService } from './user-authentication.service';
import { Orders } from '../Interfaces/Orders';


  @Injectable({
    providedIn: 'root'
  })
  export class ServiceService {
  private LoginAPI : string ='https://localhost:7280/api/users/Login';
  private RegisterAPI : string ='https://localhost:7280/api/users/Register';
  private profileup : string ='https://localhost:7280/api/users/update';
  private ProductsAPI : string ='https://localhost:7280/api/products/products';
  private CategoryAPI : string ='https://localhost:7280/api/products/category';
  private WishListAPI : string ='https://localhost:7280/api/Wish';
  private CheckoutAPI: string = 'https://localhost:7280/api/checkout';
  private HomeApi : string = 'https://localhost:7280/api/home/home-info'



    constructor(private http : HttpClient,
      private UserAuth : UserAuthenticationService
    ) { }
    UserLogin(user : LoginUser) :Observable<{token : string}>{
      return this.http.post<{token : string}>(this.LoginAPI,user)
    }
    UserRegister(user : UserDTO ) : Observable<{token : string}>{
      return this.http.post<{token : string}>(this.RegisterAPI, user);
    }

  GetProducts(categoryid ? : number , searchTerm?: string) : Observable<Product[]>{
    let params = new HttpParams();
    if(categoryid){
      params = params.set("categoryid",categoryid.toString());
    }
    if(searchTerm){
      params = params.set("searchTerm",searchTerm);
    }
    return this.http.get<Product[]>(this.ProductsAPI,{params})
  }
  GetCategory():Observable<Category[]>{
    return this.http.get<Category[]>(this.CategoryAPI)
  }
  ProfileUpdate(User: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(this.profileup, User);
}
AddToWishList(productId: number): Observable<any> {
  return this.http.post(`${this.WishListAPI}/AddProductToWishList`,productId, {
    headers: { 'Authorization': `Bearer ${this.UserAuth.GetToken()}` } // Include token
  });
}

GetWishListItems() : Observable<WishList>{
  return this.http.get<WishList>(`${this.WishListAPI}/WishListProducts`, {
   headers : {'Authorization' : `Bearer ${this.UserAuth.GetToken()}`}
  });
}
DeleteItemFromWish(productId: number): Observable<any> {
  return this.http.delete(`${this.WishListAPI}/RemoveProductFromWishList`, {
    headers: { 'Authorization': `Bearer ${this.UserAuth.GetToken()}` },
    body:  productId  // Send only the product ID
  });
}

CheckoutCreateSession(checkoutRequest: any): Observable<{ sessionId: string }> {
  return this.http.post<{ sessionId: string }>(
    'https://localhost:7280/api/checkout/create-session',
    checkoutRequest
  );
}
OrderHistory():Observable<Orders>{
return this.http.get<Orders>(`${this.CheckoutAPI}/Get-Order-history`,{
  headers : {'Authorization' : `Bearer ${this.UserAuth.GetToken()}`}
})
}
GetHomeSections():Observable<any>{
  return this.http.get<any>(`${this.HomeApi}`);
}
  }
