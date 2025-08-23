import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
constructor(private route : Router){};
ngOnInit(): void {
  window.scrollTo({top : 0, behavior : 'smooth'})
}
goToContact(){
  this.route.navigate(['/contact'],{state : {scrollToFooter : true}});
}
}
