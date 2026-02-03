import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ============ SEGURIDAD: Helmet - Headers de seguridad HTTP ============
  // Protege contra vulnerabilidades comunes configurando headers HTTP apropiados
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  }));
  
  // ============ SEGURIDAD: Rate Limiting - Limitar peticiones ============
  // Previene ataques de fuerza bruta y DoS limitando requests por IP
  const rateLimit = require('express-rate-limit');
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // límite de 100 requests por ventana
      message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  
  // ============ SEGURIDAD: Body Parser con límites ============
  // NestJS ya incluye body parser por defecto con protección
  // El límite se configura al crear la aplicación
  
  // ============ SEGURIDAD: Interceptor de Sanitización ============
  // Limpia todos los inputs para prevenir XSS y injection
  app.useGlobalInterceptors(new SanitizeInterceptor());
  
  // ============ SEGURIDAD: Validación y Sanitización Global ============
  // Valida automáticamente todos los DTOs y sanitiza inputs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remueve propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
    transform: true, // Transforma tipos automáticamente
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: false, // En producción cambiar a true
  }));
  
  // ============ CONFIGURACIÓN: Swagger ============
  const config = new DocumentBuilder()
    .setTitle('API de Cuentas - Cooperativa')
    .setDescription('Microservicio para gestión de cuentas de ahorro')
    .setVersion('1.0')
    .addTag('cuentas')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // ============ SEGURIDAD: CORS Configurado ============
  // Permite solo orígenes específicos y métodos seguros
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000', 
      'http://localhost:4000', 
      'http://localhost:4001', 
      'http://localhost:4200'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
  });
  
  await app.listen(3000);
  console.log('Microservicio de Cuentas ejecutándose en http://localhost:3000');
  console.log('Swagger disponible en http://localhost:3000/api-docs');
  console.log('✅ Medidas de seguridad activas: Helmet, Rate Limiting, CORS, Validación');
}
bootstrap();