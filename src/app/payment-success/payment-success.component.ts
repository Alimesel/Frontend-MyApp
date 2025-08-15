import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  sessionId: string = '';

  constructor(private router: Router ) {}

  ngOnInit(): void {
  }
  GoHome(){
    this.router.navigate(['/order-history'])
  }
}