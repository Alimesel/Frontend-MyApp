import { Injectable } from '@angular/core';
import { UserAuthenticaion, UserDTO } from '../Interfaces/User';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {
  private UserInformaions = new BehaviorSubject<UserDTO | null>(null);
  UserInformations$ = this.UserInformaions.asObservable();

  private isAuthenticatedSubject  = new BehaviorSubject<boolean>(this.UserAuthenticate());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  constructor() {
    this.loadUserProfileFromLocalStorage();
  }
  SetToken(Token: string): void {
    localStorage.setItem('token', Token);
    this.isAuthenticatedSubject.next(true);
    this.loadUserProfileFromLocalStorage();
  }
  
  GetToken(): string {
    return localStorage.getItem('token') || '';
  }
  
  UserAuthenticate() : boolean{
    const token = this.GetToken();
    if(token){
      return true;
    }else{
      return false;
    }
  }
 
  SetUserProfile(user  :UserDTO | null) : void{
    this.UserInformaions.next(user);
  }
  GetUserProfile(){
    return this.UserInformations$;
  }
  private loadUserProfileFromLocalStorage(): void {
  const token = this.GetToken();
  if(token){
    const decoded : any = this.decoded(token);
    const user : UserDTO ={
      id: decoded.sub,
      firstname: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
      lastName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
      userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      phoneNumber: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'] || '',
      country: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country'],
      city: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/stateorprovince']
  
    };
    this.SetUserProfile(user);
    
  }
  }
  Logout(): void{
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    this.isAuthenticatedSubject.next(false);
    this.SetUserProfile(null);
  }
 decoded(token : string) {
try {
  return jwtDecode(token)
} catch (error) {
  return null
}
 }

}
