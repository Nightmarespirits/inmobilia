import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Property } from './entities/property.entity';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPropertyDto: CreatePropertyDto): Promise<Property> {
    return await this.propertiesService.create(createPropertyDto);
  }

  @Get()
  async findAll(@Query() searchDto: SearchPropertyDto) {
    return await this.propertiesService.findAll(searchDto);
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit?: number): Promise<Property[]> {
    return await this.propertiesService.getFeatured(limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'admin')
  async getStats() {
    return await this.propertiesService.getStats();
  }

  @Get('nearby')
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
    @Query('limit') limit?: number,
  ): Promise<Property[]> {
    return await this.propertiesService.findNearby(
      latitude,
      longitude,
      radius,
      limit,
    );
  }

  @Get('agent/:agentId')
  @UseGuards(JwtAuthGuard)
  async findByAgent(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.propertiesService.findByAgent(agentId, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Property> {
    return await this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    return await this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.propertiesService.remove(id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('increment') increment: boolean = true,
  ): Promise<Property> {
    return await this.propertiesService.toggleFavorite(id, increment);
  }
}
