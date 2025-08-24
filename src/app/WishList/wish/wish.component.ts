import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/Interfaces/Product';
import { WishList } from 'src/app/Interfaces/WishList';
import { CartserviceService } from 'src/app/Service/cartservice.service';
import { DescriptionService } from 'src/app/Service/description.service';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-wish',
  templateUrl: './wish.component.html',
  styleUrls: ['./wish.component.css']
})
export class WishComponent implements OnInit {
  wishList: WishList | null = null;
  wishlistitems : Product[]=[];
  userid : number | null = null;


  constructor(private Service: ServiceService, private UserAuth: UserAuthenticationService,
    private CartSer : CartserviceService,
    private router : Router,
    private DescriptionSer: DescriptionService
  ) {}

  ngOnInit(): void {
    window.scroll({top :0,behavior : 'smooth'})
   this.GetWishListItems();
  }
  GetWishListItems() {
  this.Service.GetWishListItems().subscribe(data => {
    // Handle backend response when wishlist is empty
    if (!data || !('wishlistItems' in data) || !data.wishlistItems) {
      this.wishList = null;
      this.wishlistitems = [];
      return;
    }

    this.wishList = data;
    this.wishlistitems = data.wishlistItems.map(eachitem => ({
      ...eachitem.product,
      imageUrl: `${environment.apiUrl.replace('/api','')}/${eachitem.product.imageUrl}`,
      category: {
        id: (eachitem.product.category as any).categoryID,
        name: (eachitem.product.category as any).categoryName,
        image: (eachitem.product.category as any).categoryImage
      }
    }));
  });
}


  GetUserId(){
   this.userid = JSON.parse(localStorage.getItem('userid') || '');
  }
  removeFromWishList(productid : number){
    this.Service.DeleteItemFromWish(productid).subscribe(
      () => {
        console.log('Item deleted successfully');
        this.ngOnInit(); // Refresh the wishlist
      },
      error => {
        console.error('Error deleting item', error);
      }
    );
  }
addtocart(product : any ){
  this.CartSer.addToCart(product).subscribe(()=>{
    this.router.navigate(['/cart'])
  })
}
   showMoreProducts(product: Product) {
     this.DescriptionSer.SetProductDescription(product);
     this.router.navigate(['/product-description']);
   }
}
