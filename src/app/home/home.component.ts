import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { Category, Product } from './../Interfaces/Product';
import { CartserviceService } from '../Service/cartservice.service';
import { DescriptionService } from '../Service/description.service';
import { UserAuthenticationService } from '../Service/user-authentication.service';
import { ServiceService } from '../Service/service.service';
import { FilterService } from '../Service/filter.service';
import { environment } from 'src/environments/environment.prod';
import { ViewportScroller } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

interface HomeSection {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageUrl2: string;
  imageUrl3: string;
  imageUrl4: string;
  displayOrder: number;
  isActive: boolean;
  paragraph?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  Product: Product[] = [];
  Category: Category[] = [];
  homeSections: HomeSection[] = [];
  filteredHeroSections: HomeSection[] = [];
  filteredOtherSections: HomeSection[] = [];
  error: string | null = null;

  currentSlideIndex = 0;
  private fadeInterval?: any;
  private filterSubscription?: Subscription;
  animatedText = '';
  fullText = '';
  currentIndex = 0;
  private textAnimationInterval?: any;

  selectedCategoryId: number | null = null;
  searchTerm = '';
  private searchDebounce?: any;

  constructor(
    private Service: ServiceService,
    private CartSer: CartserviceService,
    private router: Router,
    private DescriptionSer: DescriptionService,
    private UserAuth: UserAuthenticationService,
    private filterService: FilterService,
    private viewportScroller: ViewportScroller,
    private cdr: ChangeDetectorRef,
      private snackBar: MatSnackBar    
  ) {}

  ngOnInit(): void {
    // Parallel fetch for hero sections, categories, and products
    forkJoin([
      this.Service.GetHomeSections(),
      this.Service.GetCategory(),
      this.Service.GetProducts()
    ]).subscribe({
      next: ([sectionsData, categoriesData, productsData]: any) => {

        // Home Sections
        this.homeSections = sectionsData.map((s: any) => ({
          ...s,
          imageUrl: `${environment.apiUrl.replace('/api','')}/${s.imageUrl}`,
          imageUrl2: s.imageUrl2 ? `${environment.apiUrl.replace('/api','')}/${s.imageUrl2}` : '',
          imageUrl3: s.imageUrl3 ? `${environment.apiUrl.replace('/api','')}/${s.imageUrl3}` : '',
          imageUrl4: s.imageUrl4 ? `${environment.apiUrl.replace('/api','')}/${s.imageUrl4}` : '',
        }));
        this.filteredHeroSections = this.homeSections.filter(s => s.displayOrder === 1);
        this.filteredOtherSections = this.homeSections.filter(s => s.displayOrder > 1);

        if (this.filteredHeroSections[0]?.paragraph)
          this.startTextAnimation(this.filteredHeroSections[0].paragraph);

        if (this.filteredHeroSections[0] && this.getActiveSlides(this.filteredHeroSections[0]).length > 1)
          this.startFadeSlideshow();

        // Categories
        this.Category = categoriesData.map((c: any) => ({
          ...c,
          image: `${environment.apiUrl.replace('/api','')}/${c.image}`,
        }));

        // Products
        this.Product = productsData.map((p: any) => ({
          ...p,
          imageUrl: `${environment.apiUrl.replace('/api','')}/${p.imageUrl}`
        }));

        this.cdr.markForCheck(); // OnPush update
      },
      error: (err) => {
        console.error('Home load error:', err);
        this.error = 'Failed to load home content';
      }
    });

    // Listen for filter changes
    this.filterSubscription = this.filterService.filter$.subscribe(
      ({ categoryId, searchTerm }) => this.loadProducts(categoryId, searchTerm)
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.fadeInterval);
    clearInterval(this.textAnimationInterval);
    clearTimeout(this.searchDebounce);
    this.filterSubscription?.unsubscribe();
  }

  // Hero Slideshow
  getActiveSlides(section: HomeSection): string[] {
    return [section.imageUrl, section.imageUrl2, section.imageUrl3, section.imageUrl4].filter(url => !!url);
  }

  startFadeSlideshow() {
    this.fadeInterval = setInterval(() => {
      if (!this.filteredHeroSections.length) return;
      const slides = this.getActiveSlides(this.filteredHeroSections[0]).length;
      this.currentSlideIndex = (this.currentSlideIndex + 1) % slides;
      this.cdr.markForCheck();
    }, 2000);
  }

  startTextAnimation(text: string) {
    this.fullText = text || '';
    this.currentIndex = 0;
    this.animatedText = '';
    clearInterval(this.textAnimationInterval);
    this.textAnimationInterval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.animatedText += this.fullText[this.currentIndex++];
        this.cdr.markForCheck();
      } else clearInterval(this.textAnimationInterval);
    }, 30);
  }

  scrollToProducts() { this.viewportScroller.scrollToAnchor('products-section'); }

  loadProducts(categoryID?: number, search?: string) {
    const term = search?.trim() || undefined;
    this.Service.GetProducts(categoryID, term).subscribe({
      next: (data) => {
        this.Product = data.map((p: any) => ({
          ...p,
          imageUrl: `${environment.apiUrl.replace('/api','')}/${p.imageUrl}`
        }));
        this.cdr.markForCheck();
      },
      error: (err) => { 
        this.error = 'Failed to load products';
        console.error(err);
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.loadProducts(this.selectedCategoryId ?? undefined, this.searchTerm), 350);
  }

  onCategoryChange(event: any) {
    this.selectedCategoryId = +event.target.value || null;
    this.loadProducts(this.selectedCategoryId ?? undefined, this.searchTerm);
  }

  addToCart(product: Product) {
    if (!product.selectedSize) {
      alert('Please select a size');
      this.DescriptionSer.SetProductDescription(product);
      this.router.navigate(['product-description']);
    }
  }

  showMoreProducts(product: Product) { this.DescriptionSer.SetProductDescription(product); this.router.navigate(['/product-description']); }
 private showToast(message: string) {
  this.snackBar.open(message, '✖', {
    duration: 4000,
    panelClass: ['toast-red'],  // must match your global CSS class
    horizontalPosition: 'right',
    verticalPosition: 'top'
  });
}

  addToWishlist(productId: number) {
  if (this.UserAuth.UserAuthenticate()) {
    this.Service.AddToWishList(productId).subscribe({
      next: () => {
        this.router.navigate(['/wish']);
      },
      error: (err) => {
        if (err.status === 400) {
          this.showToast('Product already in wishlist');
          this.router.navigate(['/wish']);
        } else {
          this.showToast('Failed to add product to wishlist');
        }
      }
    });
  } else {
    this.showToast('Please log in to add to wishlist');
  }
}


  trackByProductId(index: number, product: Product) { return product.id; }
}
