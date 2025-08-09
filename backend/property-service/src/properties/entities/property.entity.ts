import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IsEnum, IsNumber, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  WAREHOUSE = 'warehouse',
}

export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  RENTED = 'rented',
  PENDING = 'pending',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
  BOTH = 'both',
}

@Entity('properties')
@Index(['latitude', 'longitude'])
@Index(['price'])
@Index(['propertyType'])
@Index(['status'])
@Index(['listingType'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @IsString()
  title: string;

  @Column('text')
  @IsString()
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.HOUSE,
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @Column({
    type: 'enum',
    enum: ListingType,
    default: ListingType.SALE,
  })
  @IsEnum(ListingType)
  listingType: ListingType;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.ACTIVE,
  })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @Column('decimal', { precision: 12, scale: 2 })
  @IsNumber()
  price: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  rentPrice?: number;

  @Column('int')
  @IsNumber()
  bedrooms: number;

  @Column('int')
  @IsNumber()
  bathrooms: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  area: number; // in square meters

  @Column({ length: 500 })
  @IsString()
  address: string;

  @Column({ length: 100 })
  @IsString()
  city: string;

  @Column({ length: 100 })
  @IsString()
  state: string;

  @Column({ length: 20 })
  @IsString()
  zipCode: string;

  @Column({ length: 100 })
  @IsString()
  country: string;

  // Geolocation fields
  @Column('decimal', { precision: 10, scale: 8 })
  @IsNumber()
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  @IsNumber()
  longitude: number;

  // Property features
  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  features?: string[];

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  // Images
  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  images?: string[];

  @Column({ length: 500, nullable: true })
  @IsOptional()
  @IsString()
  mainImage?: string;

  // Agent/Owner information
  @Column('uuid')
  @IsString()
  agentId: string;

  @Column({ length: 255 })
  @IsString()
  agentName: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  agentEmail?: string;

  @Column({ length: 20, nullable: true })
  @IsOptional()
  @IsString()
  agentPhone?: string;

  // Additional fields
  @Column('int', { default: 0 })
  @IsNumber()
  views: number;

  @Column('int', { default: 0 })
  @IsNumber()
  favorites: number;

  @Column({ default: false })
  @IsBoolean()
  featured: boolean;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString()
  virtualTourUrl?: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
