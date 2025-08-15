export interface cartItem{
    Productid : number,
    Name : string,
    Quantity : number,
    Price : number
    Size : string
    ImageUrl : string
}
export interface CheckoutRequest {
    UserId : number,
    CartItems : cartItem[]
}