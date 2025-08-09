import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  user: {
    sub: string;
    email: string;
    name?: string;
    role: string;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        return false;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET', 'proptech-nexus-jwt-secret-2024'),
      });

      client.user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };

      return true;
    } catch (error) {
      return false;
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const token = client.handshake.auth?.token || 
                 client.handshake.headers?.authorization?.replace('Bearer ', '');
    return token || null;
  }
}
