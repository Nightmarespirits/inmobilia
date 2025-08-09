import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS configuration
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL', 'http://localhost:3000'),
      configService.get('API_GATEWAY_URL', 'http://localhost:3002'),
    ],
    credentials: true,
  });
  
  const port = configService.get('PORT', 3004);
  await app.listen(port);
  
  console.log(`💬 Chat Service is running on: http://localhost:${port}`);
}

bootstrap();
