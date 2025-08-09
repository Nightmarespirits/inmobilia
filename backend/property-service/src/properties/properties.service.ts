import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Property, PropertyStatus } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create(createPropertyDto);
    return await this.propertiesRepository.save(property);
  }

  async findAll(searchDto: SearchPropertyDto = {}): Promise<{
    properties: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = searchDto;

    const queryBuilder = this.propertiesRepository.createQueryBuilder('property');
    
    // Apply filters
    this.applyFilters(queryBuilder, filters);
    
    // Apply sorting
    queryBuilder.orderBy(`property.${sortBy}`, sortOrder);
    
    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    const [properties, total] = await queryBuilder.getManyAndCount();
    
    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Increment views count
    await this.propertiesRepository.update(id, {
      views: property.views + 1,
    });

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    
    Object.assign(property, updatePropertyDto);
    return await this.propertiesRepository.save(property);
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertiesRepository.remove(property);
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radius: number = 5,
    limit: number = 20,
  ): Promise<Property[]> {
    // Using Haversine formula for distance calculation
    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.status = :status', { status: PropertyStatus.ACTIVE })
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(property.latitude)) * cos(radians(property.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(property.latitude)))) <= :radius`,
        { lat: latitude, lng: longitude, radius }
      )
      .orderBy(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(property.latitude)) * cos(radians(property.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(property.latitude))))`,
        'ASC'
      )
      .setParameters({ lat: latitude, lng: longitude })
      .limit(limit);

    return await queryBuilder.getMany();
  }

  async toggleFavorite(propertyId: string, increment: boolean = true): Promise<Property> {
    const property = await this.findOne(propertyId);
    
    const newFavorites = increment 
      ? property.favorites + 1 
      : Math.max(0, property.favorites - 1);
    
    await this.propertiesRepository.update(propertyId, {
      favorites: newFavorites,
    });

    return { ...property, favorites: newFavorites };
  }

  async findByAgent(agentId: string, page: number = 1, limit: number = 20): Promise<{
    properties: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [properties, total] = await this.propertiesRepository.findAndCount({
      where: { agentId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFeatured(limit: number = 10): Promise<Property[]> {
    return await this.propertiesRepository.find({
      where: { 
        featured: true,
        status: PropertyStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    sold: number;
    rented: number;
    averagePrice: number;
  }> {
    const total = await this.propertiesRepository.count();
    const active = await this.propertiesRepository.count({
      where: { status: PropertyStatus.ACTIVE },
    });
    const sold = await this.propertiesRepository.count({
      where: { status: PropertyStatus.SOLD },
    });
    const rented = await this.propertiesRepository.count({
      where: { status: PropertyStatus.RENTED },
    });

    const avgResult = await this.propertiesRepository
      .createQueryBuilder('property')
      .select('AVG(property.price)', 'averagePrice')
      .where('property.status = :status', { status: PropertyStatus.ACTIVE })
      .getRawOne();

    return {
      total,
      active,
      sold,
      rented,
      averagePrice: parseFloat(avgResult.averagePrice) || 0,
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Property>,
    filters: Partial<SearchPropertyDto>,
  ): void {
    const {
      search,
      propertyType,
      listingType,
      status = PropertyStatus.ACTIVE,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minArea,
      maxArea,
      city,
      state,
      country,
      latitude,
      longitude,
      radius,
    } = filters;

    // Status filter (always applied)
    queryBuilder.where('property.status = :status', { status });

    // Text search
    if (search) {
      queryBuilder.andWhere(
        '(property.title ILIKE :search OR property.description ILIKE :search OR property.address ILIKE :search OR property.city ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Property type filter
    if (propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', { propertyType });
    }

    // Listing type filter
    if (listingType) {
      queryBuilder.andWhere('property.listingType = :listingType', { listingType });
    }

    // Price filters
    if (minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    // Bedroom filters
    if (minBedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms >= :minBedrooms', { minBedrooms });
    }
    if (maxBedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms <= :maxBedrooms', { maxBedrooms });
    }

    // Bathroom filters
    if (minBathrooms !== undefined) {
      queryBuilder.andWhere('property.bathrooms >= :minBathrooms', { minBathrooms });
    }
    if (maxBathrooms !== undefined) {
      queryBuilder.andWhere('property.bathrooms <= :maxBathrooms', { maxBathrooms });
    }

    // Area filters
    if (minArea !== undefined) {
      queryBuilder.andWhere('property.area >= :minArea', { minArea });
    }
    if (maxArea !== undefined) {
      queryBuilder.andWhere('property.area <= :maxArea', { maxArea });
    }

    // Location filters
    if (city) {
      queryBuilder.andWhere('property.city ILIKE :city', { city: `%${city}%` });
    }
    if (state) {
      queryBuilder.andWhere('property.state ILIKE :state', { state: `%${state}%` });
    }
    if (country) {
      queryBuilder.andWhere('property.country ILIKE :country', { country: `%${country}%` });
    }

    // Geolocation filter
    if (latitude && longitude && radius) {
      queryBuilder.andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(property.latitude)) * cos(radians(property.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(property.latitude)))) <= :radius`,
        { lat: latitude, lng: longitude, radius }
      );
    }
  }
}
