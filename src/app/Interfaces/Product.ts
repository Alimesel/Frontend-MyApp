export interface Product {
     id: number;
    name: string;
    price: number;
    quantity: number;
    description: string;
    imageUrl: string;
    selectedSize : string,
    category: Category; // Updated to match the API response
  }
export interface Category{
    id : number;
    name : string;
    image : string;
}
