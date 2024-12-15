import { IsString, IsNotEmpty, IsEmail, MinLength, Matches } from "class-validator";
export class SignupDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @Matches(/^09\d{9}$/, { message: "phone must be a valid phone nuumber" })
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    password: string;
}