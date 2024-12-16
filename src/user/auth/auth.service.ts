import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcryptjs"
import { UserType } from '@prisma/client';
import * as jwt from "jsonwebtoken"
interface signupParams {
    name: string;
    email: string;
    phone: string;
    password: string;
}
interface signinParams {
    email: string;
    password: string;
}
@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) {

    }
    async signup(
        { name, email, password, phone }: signupParams
    ) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })
        if (userExists) throw new ConflictException()
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await this.prismaService.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                userType: UserType.BUYER
            }
        })
        
        return await this.generateJWT(user.name, user.id)
    }
    async signin(
        {email,password}:signinParams
    ){
        const user = await this.prismaService.user.findUnique({
            where:{
                email
            }
        })
        if(!user) throw new HttpException("invalid credentials",400)
        const hashedPassword = user.password
        const isPasswordValid = await bcrypt.compare(password,hashedPassword)
        if(!isPasswordValid) throw new HttpException("invalid credentials",400)
        return await this.generateJWT(user.name, user.id)

    }
    private generateJWT(name:string,id:number){
        const token = jwt.sign({
            name,
            id: id
        }, process.env.JSON_TOKEN_KEY, {
            expiresIn: 360000
        })
        return token
    }
}
