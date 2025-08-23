import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';
import { CartserviceService } from 'src/app/Service/cartservice.service';
import { LoginUser, UserDTO } from 'src/app/Interfaces/User';

@Component({
  selector: 'app-auth',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ServiceService,
    private userAuth: UserAuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private CartSer: CartserviceService
  ) {}

  ngOnInit(): void {
    window.scrollTo({top : 0, behavior :'smooth'})
    // Custom validators
    const forbiddenChars = (control: AbstractControl) =>
      /<|>|{|}|\(|\)|;|script/i.test(control.value) ? { forbidden: true } : null;

    const passwordValidator = (control: AbstractControl) =>
      /^[A-Za-z0-9]+$/.test(control.value) ? null : { invalidPassword: true };

    const gmailValidator = (control: AbstractControl) =>
      control.value?.endsWith('@gmail.com') ? null : { invalidEmail: true };

    const lebanesePhoneValidator = (control: AbstractControl) =>
      /^(03|70|71|76|78|79)[0-9]{6}$/.test(control.value) ? null : { invalidPhone: true };

    // LOGIN FORM
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, forbiddenChars]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // REGISTER FORM
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, forbiddenChars]],
      lastname: ['', [Validators.required, forbiddenChars]],
      username: ['', [Validators.required, forbiddenChars]],
      Email: ['', [Validators.required, Validators.email, gmailValidator]],
      Password: ['', [Validators.required, Validators.minLength(6), passwordValidator]],
      PhoneNumber: ['', [Validators.required, lebanesePhoneValidator]],
      Country: ['', [forbiddenChars]],
      City: ['', [forbiddenChars]]
    });
  }

  // LOGIN
  onLogin() {
    if (this.loginForm.invalid) return this.showErrors(this.loginForm);

    this.service.UserLogin(this.loginForm.value).subscribe({
      next: res => {
        this.userAuth.SetToken(res.token);
        this.mergeCart();
        this.router.navigate(['/home']);
      },
      error: err => {
        if (err.status === 404 && err.error === 'Username not Found') {
          this.toastr.error('Username not found');
        } else if (err.status === 400 && err.error === 'Invalid Password') {
          this.toastr.error('Incorrect password');
        } else {
          this.toastr.error('Login failed');
        }
      }
    });
  }

  // REGISTER
  onRegister() {
    if (this.registerForm.invalid) return this.showErrors(this.registerForm);

    this.service.UserRegister(this.registerForm.value).subscribe({
      next: res => {
        this.userAuth.SetToken(res.token);
        this.mergeCart();
        this.router.navigate(['/home']);
      },
      error: err => {
        const msg = err.error;
        if (msg.includes('Username')) this.toastr.error('Username is already taken');
        else if (msg.includes('Email')) this.toastr.error('Email is already used');
        else if (msg.includes('Password')) this.toastr.error('Password invalid');
        else this.toastr.error('Registration failed');
      }
    });
  }

  // Merge guest cart with server cart after login/register
  private mergeCart() {
    const guestCart = this.CartSer.getLocalItems();
    if (guestCart.length > 0) {
      this.CartSer.addMultipleServerCart(guestCart).subscribe(() => {
        this.CartSer.ResetCart();
        this.CartSer.updateCartCount().subscribe();
      });
    }
  }

  // Show validation errors
  private showErrors(form: FormGroup) {
    Object.entries(form.controls).forEach(([key, control]) => {
      if (control.errors) {
        if (control.errors['required']) this.toastr.error(`${key} is required`);
        else if (control.errors['email']) this.toastr.error('Invalid email');
        else if (control.errors['invalidEmail']) this.toastr.error('Email must be @gmail.com');
        else if (control.errors['minlength']) this.toastr.error(`${key} is too short`);
        else if (control.errors['pattern'] && key !== 'PhoneNumber') this.toastr.error(`${key} is invalid`);
        else if (control.errors['invalidPhone']) this.toastr.error('Phone number must be a valid 8-digit Lebanese number starting with 03,70,71,76,78,79');
        else if (control.errors['forbidden']) this.toastr.error(`${key} contains forbidden characters`);
        else if (control.errors['invalidPassword']) this.toastr.error('Password must contain only letters and numbers');
      }
    });
  }
}
