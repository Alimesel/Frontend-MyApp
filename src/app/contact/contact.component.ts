import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  constructor(private router: Router) {}

  // Called when form is submitted
  submitForm() {
    // For now, just show an alert or console log
    alert('Thank you! Your message has been sent.');
    console.log('Form submitted.');
    
    // You can later integrate with backend API
    // e.g., call a ContactService to send email/message
  }

  ngOnInit() {
    // Scroll to top when opening page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
