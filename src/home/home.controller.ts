import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dtos/home.dto';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }
    @Get()
    getHome(): Promise<HomeResponseDto[]> {
        return this.homeService.getHome();
    }

    @Get(":id")
    getHomeById() {
        return {}
    }
    @Post()
    createHome() {
        return
    }
    @Put(":id")
    updateHome() {
        return {}
    }

    @Delete(":id")
    deleteHome() {

    }
}
