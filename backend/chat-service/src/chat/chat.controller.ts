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
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    return await this.chatService.createChat(createChatDto);
  }

  @Get()
  async findAllByUser(@Request() req) {
    return await this.chatService.findAllByUser(req.user.sub);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadCount(req.user.sub);
    return { unreadCount: count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.chatService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async updateChat(
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
    @Request() req,
  ) {
    return await this.chatService.updateChat(id, updateChatDto, req.user.sub);
  }

  @Delete(':id')
  async deleteChat(@Param('id') id: string, @Request() req) {
    await this.chatService.deleteChat(id, req.user.sub);
    return { message: 'Chat deleted successfully' };
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Request() req,
  ) {
    return await this.chatService.getMessages(chatId, req.user.sub, page, limit);
  }

  @Post(':id/messages')
  async createMessage(
    @Param('id') chatId: string,
    @Body() createMessageDto: Omit<CreateMessageDto, 'chatId'>,
    @Request() req,
  ) {
    const messageDto: CreateMessageDto = {
      ...createMessageDto,
      chatId,
    };
    
    return await this.chatService.createMessage(
      messageDto,
      req.user.sub,
      req.user.name || req.user.email,
    );
  }

  @Post('messages/:messageId/read')
  async markMessageAsRead(@Param('messageId') messageId: string, @Request() req) {
    return await this.chatService.markMessageAsRead(messageId, req.user.sub);
  }

  @Post(':id/read')
  async markChatAsRead(@Param('id') chatId: string, @Request() req) {
    await this.chatService.markChatAsRead(chatId, req.user.sub);
    return { message: 'Chat marked as read' };
  }

  @Post('direct')
  async findOrCreateDirectChat(
    @Body() body: { userId: string; propertyId?: string },
    @Request() req,
  ) {
    return await this.chatService.findOrCreateDirectChat(
      req.user.sub,
      body.userId,
      body.propertyId,
    );
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') chatId: string,
    @Body() body: { participantId: string },
    @Request() req,
  ) {
    return await this.chatService.addParticipant(
      chatId,
      req.user.sub,
      body.participantId,
    );
  }

  @Delete(':id/participants/:participantId')
  async removeParticipant(
    @Param('id') chatId: string,
    @Param('participantId') participantId: string,
    @Request() req,
  ) {
    return await this.chatService.removeParticipant(
      chatId,
      req.user.sub,
      participantId,
    );
  }
}
