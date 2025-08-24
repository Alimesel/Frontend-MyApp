import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../Service/service.service';
import { Orders } from '../Interfaces/Orders';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: Orders | null = null;
  errorMessage: string | null = null;

  constructor(private service: ServiceService) {}

  ngOnInit(): void {
    window.scroll({top : 0,behavior : 'smooth'})
    this.service.OrderHistory().subscribe({
      next: (data: Orders) => {
        this.orders = data;
        this.errorMessage = null;
        console.log(this.orders);
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = "You have no orders yet.";
        } else {
          this.errorMessage = err.error || "Failed to fetch order history.";
        }
        this.orders = null;
      }
    });
  }

  // Method to format price as fixed decimal string
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
