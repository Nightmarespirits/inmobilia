import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEmail,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { PropertyType, ListingType, PropertyStatus } from '../entities/property.entity';

export class CreatePropertyDto {
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsEnum(ListingType)
  listingType: ListingType;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus = PropertyStatus.ACTIVE;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rentPrice?: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  bathrooms: number;

  @IsNumber()
  @Min(1)
  area: number;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  zipCode: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsString()
  agentId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  agentName: string;

  @IsOptional()
  @IsEmail()
  agentEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  agentPhone?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;

  @IsOptional()
  @IsString()
  virtualTourUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}
