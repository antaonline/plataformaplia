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

  // CORS: lo maneja Nest tanto en dev como en producción. Antes asumíamos
  // que LiteSpeed/CyberPanel agregaba los headers via extraHeaders, pero
  // por defecto NO lo hace y los requests cross-origin desde plia.pe ->
  // api.plia.pe quedaban bloqueados ("Failed to fetch" en el browser).
  // Hacer que Nest siempre los maneje es más simple y portable.
  app.enableCors({
    origin: (origin, callback) => {
      // Permite: sin origin (curl/Postman), localhost (dev) y cualquier
      // subdominio de plia.pe (incluyendo plia.pe, api.plia.pe, etc.)
      if (
        !origin ||
        origin.includes('localhost') ||
        /^https?:\/\/(.*\.)?plia\.pe(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 86400, // cache del preflight por 24h
  });

  // Servimos /uploads desde process.cwd() (raiz del backend), que es donde
  // la IA escribe los previews/imagenes. Usar __dirname apuntaba a dist/ y
  // el build compila a dist/src, dejando los archivos fuera del path.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
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
