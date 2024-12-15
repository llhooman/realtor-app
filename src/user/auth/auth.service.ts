import { ConflictException, Injectable } from '@nestjs/common';
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
        const token = await jwt.sign({
            name,
            id: user.id
        }, process.env.JSON_TOKEN_KEY, {
            expiresIn: 360000
        })
        return token
    }
}
