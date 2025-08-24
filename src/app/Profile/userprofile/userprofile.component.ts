import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr'; // <-- Import ToastrService
import { UserDTO } from 'src/app/Interfaces/User';
import { ServiceService } from 'src/app/Service/service.service';
import { UserAuthenticationService } from 'src/app/Service/user-authentication.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
  profile: UserDTO = {
    id: 0,
    firstname: '',
    lastName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: ''
  };

  isEditing: boolean = false;
  originalProfile: UserDTO | null = null;

  constructor(
    private UserAuth: UserAuthenticationService,
    private Service: ServiceService,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    window.scroll({top: 0, behavior :'smooth'});
    this.UserAuth.GetUserProfile().subscribe(data => {
      if(data){
        this.profile = data;
        this.originalProfile = {...data }; 
      }
    });
  }

  onsubmit() {
    this.Service.ProfileUpdate(this.profile).subscribe({
      next: (data) => {
        if (data) {
          this.isEditing = false;
          this.toastr.success('Profile updated successfully'); // <-- Works now
        }
      },
      error: (err) => {
        if (err.status === 400) {
          const msg = err.error as string;
          if (msg.includes('Email')) this.toastr.error('Email is already taken');
          else if (msg.includes('Phone')) this.toastr.error('Phone number is already used');
          else this.toastr.error('Update failed');
        } else {
          this.toastr.error('Update failed');
        }
      }
    });
  }

  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    if (this.originalProfile) {
      this.profile = { ...this.originalProfile };
    }
    this.isEditing = false;
  }
}
