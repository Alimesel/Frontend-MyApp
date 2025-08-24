import { Component, OnInit, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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
    country: 'Lebanon',
    city: ''
  };

  isEditing: boolean = false;
  originalProfile: UserDTO | null = null;

  lebaneseCities: string[] = [
    'Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Jounieh', 'Byblos', 
    'Batroun', 'Baalbek', 'Saida', 'Aley', 'Bcharre', 'Rachaya', 'Jezzine', 'Nabatieh'
  ];
  selectedCity: string = '';
  filteredCities: string[] = [];
  showCityList: boolean = false;

  constructor(
    private UserAuth: UserAuthenticationService,
    private Service: ServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    window.scroll({top: 0, behavior :'smooth'});
    this.filteredCities = [...this.lebaneseCities];

    this.UserAuth.GetUserProfile().subscribe(data => {
      if(data){
        this.profile = {...data, country: 'Lebanon'};
        this.originalProfile = {...this.profile}; 
        this.selectedCity = this.profile.city;
      }
    });
  }

  // SEARCHABLE CITY METHODS
  filterCities(event: any) {
    const val = event.target.value.toLowerCase();
    this.filteredCities = this.lebaneseCities.filter(city =>
      city.toLowerCase().includes(val)
    );
    this.showCityList = true;
  }

  selectCity(city: string) {
    this.selectedCity = city;
    this.profile.city = city;
    this.showCityList = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!event.target.closest('.profile-field')) {
      this.showCityList = false;
    }
  }

  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    if (this.originalProfile) {
      this.profile = { ...this.originalProfile };
      this.selectedCity = this.profile.city;
    }
    this.isEditing = false;
  }

  onsubmit() {
    // Validate phone number
    const lebanesePhoneRegex = /^(03|70|71|76|78|79)[0-9]{6}$/;
    if (!lebanesePhoneRegex.test(this.profile.phoneNumber)) {
      this.toastr.error('Phone number must be a valid 8-digit Lebanese number starting with 03,70,71,76,78,79');
      return;
    }

    // Validate username
    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!usernameRegex.test(this.profile.userName)) {
      this.toastr.error('Username can only contain letters and numbers');
      return;
    }

    this.Service.ProfileUpdate(this.profile).subscribe({
      next: (data) => {
        if (data) {
          this.isEditing = false;
          this.originalProfile = {...this.profile};
          this.toastr.success('Profile updated successfully');
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
}
