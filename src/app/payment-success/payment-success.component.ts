import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  constructor(private router : Router){}

  ngOnInit(): void {
    this.launchConfetti();
  }

  launchConfetti() {
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }

  GoHome() {
  this.router.navigate(['/order-history'])
  }
}
