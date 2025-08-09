import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/create-message.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  user: {
    sub: string;
    email: string;
    name?: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Authentication will be handled by WsJwtGuard
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user.sub);
      console.log(`Client disconnected: ${client.id} (${client.user.email})`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      // Verify user has access to this chat
      await this.chatService.findOne(data.chatId, client.user.sub);
      
      // Join the chat room
      await client.join(data.chatId);
      this.connectedUsers.set(client.user.sub, client.id);
      
      // Notify other participants that user joined
      client.to(data.chatId).emit('user-joined', {
        userId: client.user.sub,
        userName: client.user.name || client.user.email,
      });

      return { success: true, message: 'Joined chat successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      await client.leave(data.chatId);
      
      // Notify other participants that user left
      client.to(data.chatId).emit('user-left', {
        userId: client.user.sub,
        userName: client.user.name || client.user.email,
      });

      return { success: true, message: 'Left chat successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; message: SendMessageDto },
  ) {
    try {
      // Create message in database
      const message = await this.chatService.createMessage(
        {
          chatId: data.chatId,
          ...data.message,
        },
        client.user.sub,
        client.user.name || client.user.email,
      );

      // Emit message to all participants in the chat
      this.server.to(data.chatId).emit('new-message', {
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        replyToId: message.replyToId,
        createdAt: message.createdAt,
      });

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.to(data.chatId).emit('user-typing', {
      userId: client.user.sub,
      userName: client.user.name || client.user.email,
      isTyping: true,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.to(data.chatId).emit('user-typing', {
      userId: client.user.sub,
      userName: client.user.name || client.user.email,
      isTyping: false,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const message = await this.chatService.markMessageAsRead(
        data.messageId,
        client.user.sub,
      );

      // Notify other participants that message was read
      this.server.to(message.chatId).emit('message-read', {
        messageId: message.id,
        readBy: client.user.sub,
        userName: client.user.name || client.user.email,
      });

      return { success: true, message: 'Message marked as read' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper method to send notifications to specific users
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // Helper method to get online users in a chat
  async getOnlineUsersInChat(chatId: string): Promise<string[]> {
    const room = this.server.sockets.adapter.rooms.get(chatId);
    if (!room) return [];

    const onlineUsers: string[] = [];
    for (const socketId of room) {
      const socket = this.server.sockets.sockets.get(socketId) as AuthenticatedSocket;
      if (socket && socket.user) {
        onlineUsers.push(socket.user.sub);
      }
    }

    return onlineUsers;
  }
}
