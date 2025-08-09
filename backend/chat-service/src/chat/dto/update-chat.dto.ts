import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participants?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
