import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoginUser, UserDTO } from 'src/app/Interfaces/User';
import { CartserviceService } from 'src/app/Service/cartservice.service';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';

@Component({
  selector: 'app-auth',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  loginSubmitted = false;
  registerSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private service: ServiceService,
    private userAuth: UserAuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private CartSer : CartserviceService
  ) {}

  ngOnInit(): void {
    // Login form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Register form
    this.registerForm = this.fb.group({
      firstname: [''],
      lastname: [''],
      username: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      PhoneNumber: ['', [Validators.required]],
      Country: [''],
      City: ['']
    });
  }

  // Login
onLogin() {
  this.loginSubmitted = true;
  if (this.loginForm.valid) {
    const loginUser: LoginUser = this.loginForm.value;
    this.service.UserLogin(loginUser).subscribe({
      next: (response: { token: string }) => {
        this.userAuth.SetToken(response.token);

        // Merge guest cart
        const guestCart = this.CartSer.getLocalItems();
        if (guestCart.length > 0) {
          this.CartSer.addMultipleServerCart(guestCart).subscribe({
            next: () => {
              this.CartSer.ResetCart();
              this.CartSer.updateCartCount().subscribe();
            },
            error: err => console.error('Failed to merge guest cart', err)
          });
        }

        this.router.navigate(['/home']);
      },
      error: (error) => {
        const message = error.error;
        if (error.status === 404 && message === 'Username not Found') {
          this.toastr.error('Username not found');
        } else if (error.status === 400 && message === 'Invalid Password') {
          this.toastr.error('Invalid Password');
        } else {
          this.toastr.error('Login Failed');
        }
      }
    });
  } else {
    this.loginForm.markAllAsTouched();
  }
}


  // Register
onRegister() {
  this.registerSubmitted = true;
  if (this.registerForm.valid) {
    const registerUser: UserDTO = this.registerForm.value;
    this.service.UserRegister(registerUser).subscribe({
      next: (response: { token: string }) => {
        this.userAuth.SetToken(response.token);

        // Merge guest cart
        const guestCart = this.CartSer.getLocalItems();
        if (guestCart.length > 0) {
          this.CartSer.addMultipleServerCart(guestCart).subscribe({
            next: () => {
              this.CartSer.ResetCart();
              this.CartSer.updateCartCount().subscribe();
            },
            error: err => console.error('Failed to merge guest cart', err)
          });
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Register Failed', err);
        this.toastr.error('Registration Failed');
      }
    });
  } else {
    this.registerForm.markAllAsTouched();
  }
}

}
