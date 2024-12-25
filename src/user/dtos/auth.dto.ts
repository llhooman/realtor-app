import { UserType } from "@prisma/client";
import { IsString, IsNotEmpty, IsEmail, MinLength, Matches, IsEnum, IsOptional } from "class-validator";
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

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    productKey?: string;
}
export class SigninDto {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}
export class generateProductKey {
    @IsEmail()
    email: string;
    @IsEnum(UserType)
    userType: UserType;
}