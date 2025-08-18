import { Component, OnInit } from '@angular/core';
import { CartserviceService } from '../Service/cartservice.service';
import { Router } from '@angular/router';
import { UserAuthenticationService } from '../Service/user-authentication.service';
import { ServiceService } from '../Service/service.service';
import { FilterService } from '../Service/filter.service';
import { Category } from '../Interfaces/Product';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  TotalItems = 0;
  isAuthenticated = false;


  searchTerm = '';
  userDropdownOpen = false;

  constructor(
    private CartSer: CartserviceService,
    private router: Router,
    private UserAuth: UserAuthenticationService,
    private Service: ServiceService,
    private filterService: FilterService,
  ) {}

  ngOnInit(): void {
    this.getTotalItems();
    this.UserAuth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) this.getTotalItems();
    });
  }

 
  getTotalItems() {
    this.CartSer.updateCartCount().subscribe();
    this.CartSer.cartitem$.subscribe(count => this.TotalItems = count);
  }



  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      this.UserAuth.Logout();
      this.CartSer.ResetCart();
      this.router.navigate(['/home']);
    }
  }
goToContact(){
  if(this.router.url === '/home'){
    document.getElementById('footer')?.scrollIntoView({behavior : 'smooth'})
  }
  else{
    this.router.navigate(['/home'],{state:{scrollToFooter : true}});
  }
}

}
