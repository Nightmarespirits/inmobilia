import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchQueryDto, SortBy } from './dto/search-query.dto';
import { SearchResponseDto, PropertySearchResult, SearchSuggestionsDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexName = 'properties';

  constructor(private readonly elasticsearchService: ElasticsearchService) {
    this.initializeIndex();
  }

  private async initializeIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.createIndex();
        this.logger.log(`Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (error) {
      this.logger.warn('Elasticsearch not available, using fallback search');
    }
  }

  private async createIndex() {
    await this.elasticsearchService.indices.create({
      index: this.indexName,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            type: { type: 'keyword' },
            status: { type: 'keyword' },
            price: { type: 'double' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'double' },
            area: { type: 'double' },
            location: {
              properties: {
                address: { type: 'text', analyzer: 'standard' },
                city: { type: 'keyword' },
                state: { type: 'keyword' },
                country: { type: 'keyword' },
                zipCode: { type: 'keyword' },
                coordinates: { type: 'geo_point' },
              },
            },
            amenities: { type: 'keyword' },
            yearBuilt: { type: 'integer' },
            agent: {
              properties: {
                id: { type: 'keyword' },
                firstName: { type: 'text' },
                lastName: { type: 'text' },
                email: { type: 'keyword' },
                phone: { type: 'keyword' },
              },
            },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });
  }

  async searchProperties(searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    try {
      const query = this.buildElasticsearchQuery(searchQuery);
      const sort = this.buildSortQuery(searchQuery.sortBy);
      
      const response = await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          query,
          sort,
          from: (searchQuery.page - 1) * searchQuery.limit,
          size: searchQuery.limit,
          aggs: {
            price_ranges: {
              range: {
                field: 'price',
                ranges: [
                  { to: 100000, key: 'Under $100K' },
                  { from: 100000, to: 300000, key: '$100K - $300K' },
                  { from: 300000, to: 500000, key: '$300K - $500K' },
                  { from: 500000, to: 1000000, key: '$500K - $1M' },
                  { from: 1000000, key: 'Over $1M' },
                ],
              },
            },
            property_types: {
              terms: { field: 'type', size: 10 },
            },
            locations: {
              terms: { field: 'location.city', size: 20 },
            },
          },
        },
      });

      return this.formatSearchResponse(response, searchQuery);
    } catch (error) {
      this.logger.error('Elasticsearch search failed, using fallback', error);
      return this.fallbackSearch(searchQuery);
    }
  }

  private buildElasticsearchQuery(searchQuery: SearchQueryDto) {
    const must = [];
    const filter = [];

    // Text search
    if (searchQuery.query) {
      must.push({
        multi_match: {
          query: searchQuery.query,
          fields: ['title^2', 'description', 'location.address', 'location.city'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (searchQuery.type) {
      filter.push({ term: { type: searchQuery.type } });
    }

    if (searchQuery.status) {
      filter.push({ term: { status: searchQuery.status } });
    }

    if (searchQuery.minPrice || searchQuery.maxPrice) {
      const priceRange: any = {};
      if (searchQuery.minPrice) priceRange.gte = searchQuery.minPrice;
      if (searchQuery.maxPrice) priceRange.lte = searchQuery.maxPrice;
      filter.push({ range: { price: priceRange } });
    }

    if (searchQuery.minBedrooms || searchQuery.maxBedrooms) {
      const bedroomsRange: any = {};
      if (searchQuery.minBedrooms) bedroomsRange.gte = searchQuery.minBedrooms;
      if (searchQuery.maxBedrooms) bedroomsRange.lte = searchQuery.maxBedrooms;
      filter.push({ range: { bedrooms: bedroomsRange } });
    }

    if (searchQuery.minBathrooms || searchQuery.maxBathrooms) {
      const bathroomsRange: any = {};
      if (searchQuery.minBathrooms) bathroomsRange.gte = searchQuery.minBathrooms;
      if (searchQuery.maxBathrooms) bathroomsRange.lte = searchQuery.maxBathrooms;
      filter.push({ range: { bathrooms: bathroomsRange } });
    }

    if (searchQuery.minArea || searchQuery.maxArea) {
      const areaRange: any = {};
      if (searchQuery.minArea) areaRange.gte = searchQuery.minArea;
      if (searchQuery.maxArea) areaRange.lte = searchQuery.maxArea;
      filter.push({ range: { area: areaRange } });
    }

    if (searchQuery.amenities && searchQuery.amenities.length > 0) {
      filter.push({ terms: { amenities: searchQuery.amenities } });
    }

    if (searchQuery.agentId) {
      filter.push({ term: { 'agent.id': searchQuery.agentId } });
    }

    if (searchQuery.minYearBuilt || searchQuery.maxYearBuilt) {
      const yearRange: any = {};
      if (searchQuery.minYearBuilt) yearRange.gte = searchQuery.minYearBuilt;
      if (searchQuery.maxYearBuilt) yearRange.lte = searchQuery.maxYearBuilt;
      filter.push({ range: { yearBuilt: yearRange } });
    }

    // Geolocation search
    if (searchQuery.latitude && searchQuery.longitude && searchQuery.radius) {
      filter.push({
        geo_distance: {
          distance: `${searchQuery.radius}km`,
          'location.coordinates': {
            lat: searchQuery.latitude,
            lon: searchQuery.longitude,
          },
        },
      });
    }

    // Location text search
    if (searchQuery.location) {
      must.push({
        multi_match: {
          query: searchQuery.location,
          fields: ['location.address', 'location.city', 'location.state'],
          type: 'best_fields',
        },
      });
    }

    return {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter,
      },
    };
  }

  private buildSortQuery(sortBy: SortBy): any[] {
    switch (sortBy) {
      case SortBy.PRICE_ASC:
        return [{ price: { order: 'asc' as const } }];
      case SortBy.PRICE_DESC:
        return [{ price: { order: 'desc' as const } }];
      case SortBy.DATE_ASC:
        return [{ createdAt: { order: 'asc' as const } }];
      case SortBy.DATE_DESC:
        return [{ createdAt: { order: 'desc' as const } }];
      case SortBy.DISTANCE:
        return [{ _geo_distance: { 'location.coordinates': { lat: 0, lon: 0 }, order: 'asc' as const, unit: 'km' } }];
      case SortBy.RELEVANCE:
      default:
        return [{ _score: { order: 'desc' as const } }];
    }
  }

  private formatSearchResponse(response: any, searchQuery: SearchQueryDto): SearchResponseDto {
    const hits = response.hits || response.body?.hits;
    const total = hits?.total?.value || 0;
    const results: PropertySearchResult[] = hits?.hits?.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
      distance: hit.sort && hit.sort[0] ? hit.sort[0] : undefined,
    })) || [];

    const totalPages = Math.ceil(total / searchQuery.limit);
    const aggregations = response.aggregations || response.body?.aggregations;

    return {
      results,
      total,
      page: searchQuery.page,
      limit: searchQuery.limit,
      totalPages,
      hasNextPage: searchQuery.page < totalPages,
      hasPreviousPage: searchQuery.page > 1,
      aggregations: aggregations ? {
        priceRanges: aggregations.price_ranges?.buckets?.map((bucket: any) => ({
          range: bucket.key,
          count: bucket.doc_count,
        })) || [],
        propertyTypes: aggregations.property_types?.buckets?.map((bucket: any) => ({
          type: bucket.key,
          count: bucket.doc_count,
        })) || [],
        locations: aggregations.locations?.buckets?.map((bucket: any) => ({
          city: bucket.key,
          count: bucket.doc_count,
        })) || [],
      } : undefined,
    };
  }

  private async fallbackSearch(searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    // Fallback to basic search when Elasticsearch is not available
    // This would typically query PostgreSQL directly
    this.logger.warn('Using fallback search - Elasticsearch not available');
    
    return {
      results: [],
      total: 0,
      page: searchQuery.page,
      limit: searchQuery.limit,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  async getSuggestions(query: string): Promise<SearchSuggestionsDto> {
    try {
      const response = await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          suggest: {
            location_suggest: {
              prefix: query,
              completion: {
                field: 'location.city',
                size: 5,
              },
            },
            amenity_suggest: {
              prefix: query,
              completion: {
                field: 'amenities',
                size: 5,
              },
            },
          },
        },
      });

      const suggestions = [];
      const suggest = (response as any).suggest || (response as any).body?.suggest;
      
      // Add location suggestions
      if (suggest?.location_suggest?.[0]?.options) {
        suggest.location_suggest[0].options.forEach((option: any) => {
          suggestions.push({
            text: option.text,
            type: 'location' as const,
          });
        });
      }

      // Add amenity suggestions
      if (suggest?.amenity_suggest?.[0]?.options) {
        suggest.amenity_suggest[0].options.forEach((option: any) => {
          suggestions.push({
            text: option.text,
            type: 'amenity' as const,
          });
        });
      }

      return { suggestions };
    } catch (error) {
      this.logger.error('Failed to get suggestions', error);
      return { suggestions: [] };
    }
  }

  async indexProperty(property: any): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.indexName,
        id: property.id,
        body: {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              lat: property.location.latitude,
              lon: property.location.longitude,
            },
          },
        },
      });
      
      this.logger.log(`Indexed property: ${property.id}`);
    } catch (error) {
      this.logger.error(`Failed to index property: ${property.id}`, error);
    }
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.indexName,
        id: propertyId,
      });
      
      this.logger.log(`Deleted property from index: ${propertyId}`);
    } catch (error) {
      this.logger.error(`Failed to delete property from index: ${propertyId}`, error);
    }
  }
}
