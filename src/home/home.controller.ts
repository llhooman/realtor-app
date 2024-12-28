import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dtos/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { User, UserInfo } from 'src/user/decorators/decorator.user';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }
    @Get()
    getHome(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: PropertyType,
    ): Promise<HomeResponseDto[]> {
        const price = minPrice || maxPrice ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
        } : undefined
        const filter = {
            ...(city && { city }),
            ...(price && { price }),
            ...(propertyType && { propertyType })
        }

        return this.homeService.getHome(filter);
    }

    @Get(":id")
    getHomeById() {
        return {}
    }
    @Roles(UserType.ADMIN, UserType.REALTOR)
    @UseGuards(AuthGuard)
    @Post()
    createHome(
        @Body() body: CreateHomeDto,
        @User() user: UserInfo
    ) {
        return "Home Created"
        return this.homeService.createHome(body, user.id);
    }
    @Put(":id")
    async updateHome(
        @Param("id", new ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getrealtorByHomeId(id)
        if (realtor.id !== user.id) throw new UnauthorizedException()
        return this.homeService.updateHomeById(id, body)
    }

    @Delete(":id")
    async deleteHome(
        @Param("id", new ParseIntPipe) id: number,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getrealtorByHomeId(id)
        if (realtor.id !== user.id) throw new UnauthorizedException()
        return this.homeService.deleteHomeById(id)
    }
}
