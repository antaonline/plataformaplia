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

  // CORS: lo maneja Nest tanto en dev como en producción.
  //
  // PROBLEMA detrás de LiteSpeed/CyberPanel: el proxy reenvía el request
  // con DOS headers "Origin" (el del browser + uno propio). Node concatena
  // los valores: "https://plia.pe, https://plia.pe". La librería `cors`
  // de Express, al hacer callback(null, true), refleja ese valor SUCIO en
  // el header de respuesta -> "Access-Control-Allow-Origin: https://plia.pe,
  // https://plia.pe" que es spec-inválido y el browser bloquea.
  //
  // FIX: parseamos el primer Origin del request y se lo pasamos
  // EXPLÍCITAMENTE al callback (en lugar de true), así la librería usa el
  // valor limpio en el header de respuesta.
  const parseOrigin = (raw?: string): string | null => {
    if (!raw) return null;
    const first = raw.split(',')[0].trim();
    return first || null;
  };
  const isAllowedOrigin = (origin: string): boolean => {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
    return /^https?:\/\/(.*\.)?plia\.pe(:\d+)?$/.test(origin);
  };

  app.enableCors({
    origin: (rawOrigin, callback) => {
      const clean = parseOrigin(rawOrigin);
      // Sin Origin (curl, Postman, server-to-server) lo aceptamos.
      if (!clean) {
        callback(null, false); // false = no setear Allow-Origin, request pasa
        return;
      }
      if (isAllowedOrigin(clean)) {
        // Pasamos el origin LIMPIO. La librería lo usará tal cual en
        // Access-Control-Allow-Origin -> nunca con coma.
        callback(null, clean);
      } else {
        callback(new Error(`Not allowed by CORS: ${rawOrigin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Headers permitidos: reflejamos los que el browser pida via
    // Access-Control-Request-Headers. Esto evita que Sentry/Posthog/otros
    // trackers metan headers (sentry-trace, baggage, traceparent...) y
    // bloqueen el preflight por no estar en la whitelist. Es la práctica
    // recomendada cuando el frontend es de confianza.
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'sentry-trace',
      'baggage',
      'traceparent',
      'tracestate',
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
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
