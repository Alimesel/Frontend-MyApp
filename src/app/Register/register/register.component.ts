import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAuthenticaion, UserDTO } from 'src/app/Interfaces/User';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  RegisterForm!: FormGroup;
  formSubmitted = false;

  constructor(
    private formbuilder: FormBuilder,
    private Service: ServiceService,
    private UserAuth: UserAuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.RegisterForm = this.formbuilder.group({
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

  onSubmit() {
    this.formSubmitted = true; // Mark form as submitted

    if (this.RegisterForm.valid) {
      const registeruser: UserDTO = this.RegisterForm.value;
      this.Service.UserRegister(registeruser).subscribe({
        next: (response: {token : string}) => {
          this.UserAuth.SetToken(response.token);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Register Failed', err);
        }
      });
    }
  }
}
