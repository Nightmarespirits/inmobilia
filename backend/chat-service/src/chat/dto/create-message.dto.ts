import { IsEnum, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsUUID()
  chatId: string;

  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
