import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, ChatType } from './entities/chat.entity';
import { Message, MessageStatus } from './entities/message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatRepository.create({
      ...createChatDto,
      lastMessageAt: new Date(),
    });

    return await this.chatRepository.save(chat);
  }

  async findAllByUser(userId: string): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: {
        participants: userId as any, // TypeORM array contains
      },
      order: {
        lastMessageAt: 'DESC',
      },
      relations: ['messages'],
    });
  }

  async findOne(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.participants.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    return chat;
  }

  async updateChat(id: string, updateChatDto: UpdateChatDto, userId: string): Promise<Chat> {
    const chat = await this.findOne(id, userId);

    // Only allow certain users to update chat (e.g., admin or creator)
    Object.assign(chat, updateChatDto);
    
    return await this.chatRepository.save(chat);
  }

  async deleteChat(id: string, userId: string): Promise<void> {
    const chat = await this.findOne(id, userId);
    await this.chatRepository.remove(chat);
  }

  async createMessage(createMessageDto: CreateMessageDto, senderId: string, senderName: string): Promise<Message> {
    const chat = await this.findOne(createMessageDto.chatId, senderId);

    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId,
      senderName,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update chat's last message info
    await this.chatRepository.update(chat.id, {
      lastMessage: createMessageDto.content,
      lastMessageAt: new Date(),
    });

    return savedMessage;
  }

  async getMessages(chatId: string, userId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    await this.findOne(chatId, userId); // Verify user has access

    return await this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user has access to this chat
    await this.findOne(message.chatId, userId);

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      message.status = MessageStatus.READ;
      return await this.messageRepository.save(message);
    }

    return message;
  }

  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    await this.findOne(chatId, userId); // Verify access

    const unreadMessages = await this.messageRepository.find({
      where: {
        chatId,
        senderId: userId as any, // Not equal to userId (messages not sent by user)
      },
    });

    for (const message of unreadMessages) {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        message.status = MessageStatus.READ;
        await this.messageRepository.save(message);
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userChats = await this.findAllByUser(userId);
    let unreadCount = 0;

    for (const chat of userChats) {
      const unreadMessages = await this.messageRepository.count({
        where: {
          chatId: chat.id,
          readBy: userId as any, // Not contains userId
        },
      });
      unreadCount += unreadMessages;
    }

    return unreadCount;
  }

  async findOrCreateDirectChat(user1Id: string, user2Id: string, propertyId?: string): Promise<Chat> {
    // Try to find existing direct chat between these users
    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .andWhere(':user1 = ANY(chat.participants)', { user1: user1Id })
      .andWhere(':user2 = ANY(chat.participants)', { user2: user2Id })
      .andWhere(propertyId ? 'chat.propertyId = :propertyId' : 'chat.propertyId IS NULL', { propertyId })
      .getOne();

    if (existingChat) {
      return existingChat;
    }

    // Create new direct chat
    const chatData: CreateChatDto = {
      type: ChatType.DIRECT,
      participants: [user1Id, user2Id],
      propertyId,
    };

    return await this.createChat(chatData);
  }

  async addParticipant(chatId: string, userId: string, newParticipantId: string): Promise<Chat> {
    const chat = await this.findOne(chatId, userId);

    if (!chat.participants.includes(newParticipantId)) {
      chat.participants.push(newParticipantId);
      return await this.chatRepository.save(chat);
    }

    return chat;
  }

  async removeParticipant(chatId: string, userId: string, participantId: string): Promise<Chat> {
    const chat = await this.findOne(chatId, userId);

    chat.participants = chat.participants.filter(id => id !== participantId);
    return await this.chatRepository.save(chat);
  }
}
