import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category, Product } from './../Interfaces/Product';
import { CartserviceService } from '../Service/cartservice.service';
import { DescriptionService } from '../Service/description.service';
import { UserAuthenticationService } from '../Service/user-authentication.service';
import { ServiceService } from '../Service/service.service';
import { FilterService } from '../Service/filter.service';
import { environment } from 'src/environments/environment.prod';
import { ViewportScroller } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

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
})
export class HomeComponent implements OnInit, OnDestroy {
  Product: Product[] = [];
  Category: Category[] = [];
  homeSections: HomeSection[] = [];
  filteredHeroSections: HomeSection[] = [];
  filteredOtherSections: HomeSection[] = [];
  error: string | null = null;

  currentSlideIndex = 0;
  private slideInterval?: any;
  private filterSubscription?: Subscription;

  animatedText = '';
  fullText = '';
  currentIndex = 0;
  private textAnimationInterval?: any;

  selectedCategoryId: number | null = null;
  searchTerm = '';
  private searchDebounce?: any;

  // Track loaded images to prevent re-loading
  loadedImages = new Set<string>();
  isBrowser: boolean;

  constructor(
    private Service: ServiceService,
    private CartSer: CartserviceService,
    private router: Router,
    private DescriptionSer: DescriptionService,
    private UserAuth: UserAuthenticationService,
    private filterService: FilterService,
    private viewportScroller: ViewportScroller,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadHomeSections();
    this.loadCategories();
    this.loadProducts();

    this.filterSubscription = this.filterService.filter$.subscribe(
      ({ categoryId, searchTerm }) => {
        this.loadProducts(categoryId, searchTerm);
      }
    );
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    clearInterval(this.slideInterval);
    clearInterval(this.textAnimationInterval);
    clearTimeout(this.searchDebounce);
  }

  // Search
  onSearch(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.loadProducts(this.selectedCategoryId ?? undefined, this.searchTerm);
    }, 350);
  }

  onCategoryChange(event: any): void {
    this.selectedCategoryId = +event.target.value || null;
    this.loadProducts(this.selectedCategoryId ?? undefined, this.searchTerm);
  }

  // Hero Slider
  startTextAnimation(text: string) {
    this.fullText = text;
    this.currentIndex = 0;
    this.animatedText = '';
    clearInterval(this.textAnimationInterval);

    this.textAnimationInterval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.animatedText += this.fullText[this.currentIndex++];
      } else {
        clearInterval(this.textAnimationInterval);
      }
    }, 30);
  }

  loadHomeSections() {
    this.Service.GetHomeSections().subscribe({
      next: (data: any) => {
        this.homeSections = data.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          paragraph: section.paragraph,
          imageUrl: `${environment.apiUrl.replace('/api', '')}/${section.imageUrl}`,
          imageUrl2: section.imageUrl2
            ? `${environment.apiUrl.replace('/api', '')}/${section.imageUrl2}`
            : '',
          imageUrl3: section.imageUrl3
            ? `${environment.apiUrl.replace('/api', '')}/${section.imageUrl3}`
            : '',
          imageUrl4: section.imageUrl4
            ? `${environment.apiUrl.replace('/api', '')}/${section.imageUrl4}`
            : '',
          displayOrder: section.displayOrder,
          isActive: section.isActive,
        }));

        this.filteredHeroSections = this.homeSections.filter(
          (s) => s.displayOrder === 1
        );
        this.filteredOtherSections = this.homeSections.filter(
          (s) => s.displayOrder > 1
        );

        if (this.filteredHeroSections[0]?.paragraph)
          this.startTextAnimation(this.filteredHeroSections[0].paragraph);

        if (
          this.filteredHeroSections[0] &&
          this.getActiveSlides(this.filteredHeroSections[0]).length > 1
        ) {
          this.startAutoSlide();
        }
      },
      error: (error) => console.error('Failed to load home sections:', error),
    });
  }

  scrollToProducts() {
    this.viewportScroller.scrollToAnchor('products-section');
  }

  getActiveSlides(section: HomeSection): string[] {
    return [
      section.imageUrl,
      section.imageUrl2,
      section.imageUrl3,
      section.imageUrl4,
    ].filter((url) => !!url);
  }

  startAutoSlide() {
    if (!this.isBrowser) return;
    
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  nextSlide() {
    if (!this.filteredHeroSections.length) return;
    const slides = this.getActiveSlides(this.filteredHeroSections[0]).length;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % slides;
  }

  prevSlide() {
    if (!this.filteredHeroSections.length) return;
    const slides = this.getActiveSlides(this.filteredHeroSections[0]).length;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + slides) % slides;
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
  }

  // Track image load status
  onImageLoad(imageUrl: string) {
    this.loadedImages.add(imageUrl);
  }

  isImageLoaded(imageUrl: string): boolean {
    return this.loadedImages.has(imageUrl);
  }

  // Categories & Products
  loadCategories() {
    this.Service.GetCategory().subscribe({
      next: (data) =>
        (this.Category = data.map((cat: any) => ({
          ...cat,
          image: `${environment.apiUrl.replace('/api', '')}/${cat.image}`,
        }))),
      error: (error) => {
        this.error = 'Failed to load categories';
        console.error(error);
      },
    });
  }

  loadProducts(categoryID?: number, search?: string) {
    const searchTerm = search?.trim() || undefined;
    this.Service.GetProducts(categoryID, searchTerm).subscribe({
      next: (data) =>
        (this.Product = data.map((product: any) => ({
          ...product,
          imageUrl: `${environment.apiUrl.replace('/api', '')}/${product.imageUrl}`,
        }))),
      error: (error) => {
        this.error = 'Failed to load products';
        console.error(error);
      },
    });
  }

  addToCart(Product: Product) {
    if (!Product.selectedSize) {
      alert('Please select a size');
      this.DescriptionSer.SetProductDescription(Product);
      this.router.navigate(['product-description']);
    }
  }

  showMoreProducts(product: Product) {
    this.DescriptionSer.SetProductDescription(product);
    this.router.navigate(['/product-description']);
  }

  addToWishlist(productId: number) {
    if (this.UserAuth.UserAuthenticate()) {
      this.Service.AddToWishList(productId).subscribe({
        next: () => this.router.navigate(['/wish']),
        error: (error) => {
          if (error.status === 400) {
            alert('Product already in the wishlist.');
            this.router.navigate(['/wish']);
          }
        },
      });
    } else {
      alert('Please log in first to add to the wishlist.');
      this.router.navigate(['/login']);
    }
  }

  trackByProductId(index: number, product: Product) {
    return product.id;
  }
}