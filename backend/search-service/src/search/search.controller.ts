import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto, SearchSuggestionsDto } from './dto/search-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('properties')
  async searchProperties(@Query() searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    return await this.searchService.searchProperties(searchQuery);
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string): Promise<SearchSuggestionsDto> {
    return await this.searchService.getSuggestions(query);
  }

  @Post('index/:propertyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'admin')
  @HttpCode(HttpStatus.OK)
  async indexProperty(
    @Param('propertyId') propertyId: string,
    @Body() property: any,
  ): Promise<{ message: string }> {
    await this.searchService.indexProperty({ id: propertyId, ...property });
    return { message: 'Property indexed successfully' };
  }

  @Delete('index/:propertyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent', 'admin')
  @HttpCode(HttpStatus.OK)
  async deleteFromIndex(
    @Param('propertyId') propertyId: string,
  ): Promise<{ message: string }> {
    await this.searchService.deleteProperty(propertyId);
    return { message: 'Property removed from index successfully' };
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
