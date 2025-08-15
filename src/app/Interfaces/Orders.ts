export interface Orders {
  orderId: number;
  userId: number;
  createdAt: string;
  totalAmount: number;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  name: string;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  imageUrl: string;
  size  :string
}
