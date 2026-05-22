import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import { json, urlencoded } from 'express'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'


async function bootstrap() {
  dotenv.config()

  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const frontendUrl =
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    'http://localhost:3001';
  const port = Number(process.env.PORT || 3002);

  app.setGlobalPrefix('api');

  // Los proyectos generados por la IA (varios TSX) superan el limite por
  // defecto de 100KB; subimos el limite del body para el preview/iachat.
  app.use(json({ limit: '25mb' }))
  app.use(urlencoded({ extended: true, limit: '25mb' }))

  // ✅ cookies (refresh token)
  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // En producción, OpenLiteSpeed agrega Access-Control-Allow-Origin automáticamente
  // via su CORS proxy integrado. Si NestJS también lo agrega, el header queda duplicado
  // y Chrome rechaza la respuesta. Solo habilitamos CORS en NestJS para desarrollo local.
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || origin.includes('localhost') || origin.includes('plia.pe')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    });
  }

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // ✅ Swagger
  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('Documentación automática')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(port)
}
bootstrap()
