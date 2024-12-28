import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';
import { NotFoundError } from 'rxjs';

interface getHomeParam {
    city?: string;
    price?: {
        gte?: number,
        lte?: number,
    }
    propertyType?: PropertyType;
}

interface CreateHomeParams {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: { url: string }[];
}

interface UpdateHomeParams {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) { }
    async getHome(filter: getHomeParam): Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                propertyType: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                images: {
                    select: {
                        url: true,
                    },
                    take: 1
                }

            },
            where: filter
        })
        if (!homes.length) throw new NotFoundException()
        return homes.map(home => new HomeResponseDto({ ...home, images: home.images[0].url }))
    }

    async createHome({ address, city, images, landSize, numberOfBathrooms, numberOfBedrooms, price, propertyType }: CreateHomeParams
        , userId: number
    ) {

        const home = await this.prismaService.home.create({
            data: {
                address,
                city,
                land_size: landSize,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                price,
                propertyType,
                relator_id: userId
            }
        })

        const homeImages = images.map((image) => {
            return { url: image.url, home_id: home.id }
        })

        await this.prismaService.image.createMany({
            data: homeImages
        })

        return new HomeResponseDto(home)

    }

    async updateHomeById(id: number, data: UpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            }
        })

        if (!home) throw new NotFoundException()

        const updatedHome = await this.prismaService.home.update({
            where: {
                id
            },
            data
        })

        return new HomeResponseDto(updatedHome)
    }

    async deleteHomeById(id: number) {
        const images = await this.prismaService.image.deleteMany({
            where: {
                home_id: id
            }
        })

        const home = await this.prismaService.home.delete({
            where: {
                id
            }
        })

        if (!home) throw new NotFoundException()
    }

    async getrealtorByHomeId(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            },
            select: {
                realtor: {
                    select: {
                        name: true,
                        id: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        })
        if (!home) throw new NotFoundException()

        return home.realtor
    }
}
