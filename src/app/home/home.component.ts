import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category, Product } from './../Interfaces/Product';
import { CartserviceService } from '../Service/cartservice.service';
import { DescriptionService } from '../Service/description.service';
import { UserAuthenticationService } from '../Service/user-authentication.service';
import { ServiceService } from '../Service/service.service';
import { FilterService } from '../Service/filter.service';
import { environment } from 'src/environments/environment.prod';
import { ViewportScroller } from '@angular/common';

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
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  Product: Product[] = [];
  Category: Category[] = [];
  homeSections: HomeSection[] = [];
  filteredHeroSections: HomeSection[] = [];
  filteredOtherSections: HomeSection[] = [];
  error: string | null = null;
  currentSlideIndex = 0;
  private slideInterval: any;
  private filterSubscription?: Subscription;
  animatedText = '';
  fullText = '';
  currentIndex = 0;
  private textAnimationInterval: any;

  // search + category selection state
  selectedCategoryId: number | null = null;
  searchTerm: string = '';

  constructor(
    private Service: ServiceService,
    private CartSer: CartserviceService,
    private router: Router,
    private DescriptionSer: DescriptionService,
    private UserAuth: UserAuthenticationService,
    private filterService: FilterService,
    private activatedroute: ActivatedRoute,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.loadHomeSections();
    this.loadCategories();
    this.loadProducts();

    this.filterSubscription = this.filterService.filter$.subscribe(
      ({ categoryId, searchTerm }) => {
        this.loadProducts(categoryId, searchTerm);
      }
    );

    if (history.state.scrollToFooter) {
      setTimeout(() => {
        document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    if (this.slideInterval) clearInterval(this.slideInterval);
    if (this.textAnimationInterval) clearInterval(this.textAnimationInterval);
  }

  // 🔎 Trigger search
  onSearch(): void {
    this.loadProducts(this.selectedCategoryId ?? undefined, this.searchTerm);
  }

  // 📂 Category change
  onCategoryChange(event: any): void {
    this.selectedCategoryId = +event.target.value || null;
    this.loadProducts(this.selectedCategoryId ?? undefined, this.searchTerm);
  }

  startTextAnimation(text: string) {
    this.fullText = text;
    this.currentIndex = 0;
    this.animatedText = '';
    
    if (this.textAnimationInterval) clearInterval(this.textAnimationInterval);

    this.textAnimationInterval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.animatedText += this.fullText[this.currentIndex];
        this.currentIndex++;
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
          imageUrl: `${environment.apiUrl.replace('/api','')}/${section.imageUrl}`,
          imageUrl2: `${environment.apiUrl.replace('/api','')}/${section.imageUrl2}`,
          imageUrl3: `${environment.apiUrl.replace('/api','')}/${section.imageUrl3}`,
          imageUrl4: section.imageUrl4 ? `${environment.apiUrl.replace('/api','')}/${section.imageUrl4}` : '',
          displayOrder: section.displayOrder,
          isActive: section.isActive
        }));

        this.filteredHeroSections = this.homeSections.filter(s => s.displayOrder === 1);
        this.filteredOtherSections = this.homeSections.filter(s => s.displayOrder > 1);

        if (this.filteredHeroSections.length > 0 && this.filteredHeroSections[0].paragraph) {
          this.startTextAnimation(this.filteredHeroSections[0].paragraph);
        }

        if (this.filteredHeroSections.length > 0) {
          const heroSection = this.filteredHeroSections[0];
          if (heroSection.imageUrl2 || heroSection.imageUrl3) this.startAutoSlide();
        }
      },
      error: (error) => console.error('Failed to load home sections:', error)
    });
  }

  scrollToProducts() {
    this.viewportScroller.scrollToAnchor('products-section');
  }

  getActiveSlides(section: HomeSection): string[] {
    return [section.imageUrl, section.imageUrl2, section.imageUrl3, section.imageUrl4].filter(url => !!url);
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  nextSlide() {
    if (!this.filteredHeroSections.length) return;
    const heroSection = this.filteredHeroSections[0];
    const maxSlides = this.getActiveSlides(heroSection).length;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % maxSlides;
  }

  prevSlide() {
    if (!this.filteredHeroSections.length) return;
    const heroSection = this.filteredHeroSections[0];
    const maxSlides = this.getActiveSlides(heroSection).length;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + maxSlides) % maxSlides;
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
  }

  loadCategories() {
    this.Service.GetCategory().subscribe({
      next: (data) => {
        this.Category = data.map((cat: any) => ({
          ...cat,
          image: `${environment.apiUrl.replace('/api','')}/${cat.image}`,
        }));
      },
      error: (error) => {
        this.error = 'Failed to load categories';
        console.error(error);
      },
    });
  }

  loadProducts(categoryID?: number, search?: string) {
    const searchTerm = search?.trim() ? search.trim() : undefined;
    this.Service.GetProducts(categoryID, searchTerm).subscribe({
      next: (data) => {
        this.Product = data.map((product: any) => ({
          ...product,
          imageUrl: `${environment.apiUrl.replace('/api','')}/${product.imageUrl}`,
        }));
      },
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
}
