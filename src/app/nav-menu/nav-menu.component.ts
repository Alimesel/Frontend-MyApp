import { Component, OnInit } from '@angular/core';
import { CartserviceService } from '../Service/cartservice.service';
import { Router } from '@angular/router';
import { UserAuthenticationService } from '../Service/user-authentication.service';
import { ServiceService } from '../Service/service.service';
import { FilterService } from '../Service/filter.service';
import { Category } from '../Interfaces/Product';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  TotalItems = 0;
  isAuthenticated = false;

  categories: Category[] = [];
  selectedCategoryId?: number;
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
    this.loadCategories();
    this.UserAuth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) this.getTotalItems();
    });
  }

  loadCategories() {
    this.Service.GetCategory().subscribe({
      next: data => {
        this.categories = data.map(cat => ({
          ...cat,
          image: `https://localhost:7280/${cat.image}`
        }));
      },
      error: err => console.error('Failed to load categories', err)
    });
  }

  getTotalItems() {
    this.CartSer.updateCartCount().subscribe();
    this.CartSer.cartitem$.subscribe(count => this.TotalItems = count);
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategoryId = categoryId || undefined;
    this.emitFilterChange();
    setTimeout(() => {
    const section = document.getElementById('products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, 200);
  }

  onSearchChange() {
    this.emitFilterChange();
    const section = document.getElementById('products-section');
    if(section){
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  emitFilterChange() {
    this.filterService.updateFilter({
      categoryId: this.selectedCategoryId,
      searchTerm: this.searchTerm
    });
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

  // Fix for event typing issue on mobile category dropdown
 onMobileCategoryChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  const value = select.value;
  this.selectedCategoryId = value ? +value : undefined;
  this.emitFilterChange();
  const section = document.getElementById('products-section')
  if(section){
    section.scrollIntoView({behavior: 'smooth'})
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
