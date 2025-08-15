import { Component, OnInit } from '@angular/core';
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
  originalProfile: UserDTO | null = null; // Initialize as null

  constructor(
   
    private UserAuth : UserAuthenticationService,
    private Service : ServiceService
  ) {}

  ngOnInit(): void {
   this.UserAuth.GetUserProfile().subscribe(data => {
     if(data){
       this.profile = data;
       this.originalProfile = {...data }; 
     }
   })
  }

 onsubmit(){
   this.Service.ProfileUpdate(this.profile).subscribe(data => {
     if(data){
       console.log('Profile Updated');
       this.isEditing = false;
     }
   })
 }

  enableEditing() {
    this.isEditing = true;
  }


  cancelEditing() {
    if (this.originalProfile) { // Ensure originalProfile is not null
      this.profile = { ...this.originalProfile }; // Revert to original data
    }
    this.isEditing = false; // Exit editing mode
  }
  
}
