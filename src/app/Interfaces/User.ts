export interface UserDTO {
    id: number;
    firstname: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    country: string;
    city: string;
}

export interface LoginUser {
    userName: string;
    password: string;
}
export interface UserAuthenticaion{
    token : string;
}

