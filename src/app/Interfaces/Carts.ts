import { Product } from "./Product";

export interface Cart {
  cartId: number;
  userId: number;
  cartItems: {
    cartItemId: number;
    productId: number;
    quantity: number;
    size : string,
    products: Product;
  }[];
  
}
export interface removeRequest{
  productid : number,
  size : string
}