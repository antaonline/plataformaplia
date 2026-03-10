import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'


async function bootstrap() {
  dotenv.config()

  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix('api');

  // ✅ cookies (refresh token)
  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.enableCors({
    origin: "http://localhost:3001",
    credentials: true,
  });

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

  await app.listen(3000)
}
bootstrap()
