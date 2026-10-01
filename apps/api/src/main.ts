import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Validação estrita de segredos para ambiente de produção
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32 || secret.includes('dev_fallback_insecure') || secret.includes('urboa_zelo_jwt')) {
      throw new Error(
        '[SECURITY FATAL] A variável JWT_SECRET deve ser configurada em produção com uma chave forte exclusiva de no mínimo 32 caracteres.',
      );
    }
  }

  const app = await NestFactory.create(AppModule);

  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // O frontend Next.js define sua própria política
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida por política de segurança CORS.'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`Urboa NestJS API inicializada com sucesso na porta ${port}`, 'Bootstrap');
}

await bootstrap();
