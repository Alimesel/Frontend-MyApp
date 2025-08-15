import { Product } from "./Product";

export interface WishList {
  wishId: number;
  userId: number;
  createdAt: string;
  wishlistItems: WishlistItem[];
}

export interface WishlistItem {
  wishlistItemId: number;
  wishId: number;
  productId: number;
  product: Product;
}
