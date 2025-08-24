import { OrderHistoryComponent } from './order-history/order-history.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { ScrollingModule } from '@angular/cdk/scrolling'; // <-- added for virtual scroll

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './Login/login/login.component';
import { ServiceService } from './Service/service.service';
import { UserprofileComponent } from './Profile/userprofile/userprofile.component';
import { CartComponent } from './Cart/cart/cart.component';
import { ShowMoreComponent } from './Product-Details/show-more/show-more.component';
import { WishComponent } from './WishList/wish/wish.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    LoginComponent,
    UserprofileComponent,
    CartComponent,
    ShowMoreComponent,
    WishComponent, 
    OrderHistoryComponent,
    FooterComponent,
    AboutComponent,
    ContactComponent,
    PaymentSuccessComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ScrollingModule, // <-- added here
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      timeOut: 1500,
    }),
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full', title: 'Products' },
      { path: 'home', component: HomeComponent, title: 'Products' },
      { path: 'login', component: LoginComponent, title: 'Login' },
      { path: 'profile', component: UserprofileComponent, title: 'Profile' },
      { path: 'cart', component: CartComponent, title: 'Cart' },
      { path: 'product-description', component: ShowMoreComponent, title: 'Product-Details' },
      { path: 'wish', component: WishComponent, title: 'Favorites' },
      { path: 'payment-success', component: PaymentSuccessComponent, title: 'Payment Successful' },
      { path: 'order-history', component: OrderHistoryComponent, title: 'Order History' },
      { path: 'about', component: AboutComponent, title: 'About' },
      { path: 'contact', component: ContactComponent, title: 'Contact' }
    ])
  ],
  providers: [
    ServiceService, 
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
