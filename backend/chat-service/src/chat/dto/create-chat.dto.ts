import { IsEnum, IsOptional, IsString, IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { ChatType } from '../entities/chat.entity';

export class CreateChatDto {
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  participants: string[];

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
