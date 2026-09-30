import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  try {
    process.loadEnvFile();
  } catch {
    // .env opcional
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const corsOrigin = process.env.CORS_ORIGIN?.trim()
    ? process.env.CORS_ORIGIN.split(',')
    : true;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SMIA API')
    .setDescription('API del Sistema de Gestión de Trámites')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  console.log(`SMIA Backend running on http://localhost:${port}`);
  console.log(`API Docs available at http://localhost:${port}/api/docs`);
}
bootstrap();