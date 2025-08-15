import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoginUser, UserAuthenticaion } from 'src/app/Interfaces/User';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  token : UserAuthenticaion | undefined
  formsubmitted = false;
  loginform!: FormGroup;

  constructor(
    private formbuilder: FormBuilder,
    private Service: ServiceService,
    private Router: Router,
    private UserAuth : UserAuthenticationService,
    private Toastr : ToastrService
  ) { }

  ngOnInit() {
    this.loginform = this.formbuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required,Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.formsubmitted = true;
    if (this.loginform.valid) {
      const loginuser: LoginUser = this.loginform.value;
      this.Service.UserLogin(loginuser).subscribe({
        next: (response: {token : string}) => {
            this.UserAuth.SetToken(response.token);
            
           this.Router.navigate(['/home'])
         
        },
        error : (error) => {
         if(error.status === 404){
          this.Toastr.error("Username not found")
         }else if(error.status === 400){
          this.Toastr.error("Invalid Password")
         }
        }
       
      });
    }else{
      this.loginform.markAllAsTouched();
    }
  }
}
