import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
scrollup(){
  window.scrollTo({top :0 ,behavior : 'smooth'})
}
ScrollToProducts(){
  const element = document.getElementById('products-section');
  if(element){
    element.scrollIntoView({behavior :'smooth',block : 'start'})
  }
}
handleClick(event : Event){
  event.preventDefault();
}
}
