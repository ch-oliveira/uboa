import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

import { json, urlencoded } from 'express';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const secret = process.env.JWT_SECRET;
  const isStaging =
    process.env.NODE_ENV === 'staging' ||
    process.env.RENDER_SERVICE_NAME?.includes('staging') ||
    process.env.DATABASE_URL?.includes('schema=staging');

  // Validação estrita de segredos apenas para produção real (não-staging)
  if (process.env.NODE_ENV === 'production' && !isStaging) {
    if (!secret || secret.length < 32 || secret.includes('dev_fallback_insecure') || secret.includes('urboa_zelo_jwt')) {
      throw new Error(
        '[SECURITY FATAL] A variável JWT_SECRET deve ser configurada em produção com uma chave forte exclusiva de no mínimo 32 caracteres.',
      );
    }
  } else if (!secret || secret.length < 32) {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'urboa_staging_jwt_secret_2026_super_secure_key_32c';
    Logger.warn(
      'JWT_SECRET não configurado ou menor que 32 caracteres. Usando chave segura padrão para ambiente de homologação/desenvolvimento.',
      'Bootstrap',
    );
  }

  const app = await NestFactory.create(AppModule);

  // Endpoints raiz de health check para Render e proxies
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', service: 'Urboa API', timestamp: new Date().toISOString() });
  });
  expressApp.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // O frontend Next.js define sua própria política
  }));

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
  const frontendUrl = rawFrontendUrl.replace(/\/+$/, '');
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin === 'https://uboa.vercel.app' ||
        (origin.endsWith('.vercel.app') && (origin.includes('uboa') || origin.includes('ch-oliveira')))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida por política de segurança CORS.'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3003;
  await app.listen(port, '0.0.0.0');
  Logger.log(`Urboa NestJS API inicializada com sucesso na porta ${port}`, 'Bootstrap');
}

await bootstrap();
