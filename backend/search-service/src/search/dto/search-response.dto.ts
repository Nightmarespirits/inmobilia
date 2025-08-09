export interface PropertySearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  images: string[];
  amenities: string[];
  yearBuilt: number;
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  distance?: number; // in kilometers, only when location-based search
  score?: number; // relevance score
}

export interface SearchResponseDto {
  results: PropertySearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  aggregations?: {
    priceRanges: {
      range: string;
      count: number;
    }[];
    propertyTypes: {
      type: string;
      count: number;
    }[];
    locations: {
      city: string;
      count: number;
    }[];
  };
}

export interface SearchSuggestionsDto {
  suggestions: {
    text: string;
    type: 'location' | 'property_type' | 'amenity';
    count?: number;
  }[];
}
