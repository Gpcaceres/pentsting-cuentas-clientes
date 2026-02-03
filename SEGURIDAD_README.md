# 🔐 Guía Rápida de Seguridad

## Instalación de Dependencias

### Microservicio de Cuentas (NestJS)

```bash
cd microservicio-cuentas

# Instalar las nuevas dependencias de seguridad
npm install

# Las siguientes librerías se han agregado:
# - helmet: Headers de seguridad HTTP
# - express-rate-limit: Limitación de peticiones
# - @nestjs/throttler: Rate limiting de NestJS
# - class-sanitizer: Sanitización de clases
# - xss: Filtro XSS
```

### Microservicio de Socios (Spring Boot)

```bash
cd socios

# Descargar dependencias Maven
./mvnw clean install

# Las siguientes dependencias se han agregado:
# - spring-boot-starter-security
# - owasp-encoder
# - owasp-java-html-sanitizer
```

## Verificación de Seguridad

### 1. Verificar Headers HTTP

```bash
# Probar microservicio de cuentas
curl -I http://localhost:3000/api/cuentas

# Deberías ver:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

### 2. Probar Rate Limiting

```bash
# Ejecutar 101 requests rápidamente
for i in {1..101}; do
  curl http://localhost:3000/api/cuentas
  echo "Request $i"
done

# Después de 100 requests, deberías recibir:
# HTTP 429 Too Many Requests
```

### 3. Probar Sanitización XSS

```bash
# Intentar inyectar un script
curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "<script>alert('XSS')</script>",
    "numeroCuenta": "001-123456",
    "saldo": 1000,
    "tipoCuenta": "AHORRO"
  }'

# Deberías recibir error de validación
```

### 4. Probar Validaciones Estrictas

```bash
# Enviar datos inválidos
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "identificacion": "abc123",
    "nombres": "123",
    "apellidos": "<script>",
    "tipoIdentificacion": "INVALID"
  }'

# Deberías recibir errores de validación detallados
```

## Variables de Entorno

### Microservicio de Cuentas

Crea un archivo `.env` en `microservicio-cuentas/`:

```env
# Orígenes permitidos para CORS (separados por coma)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200

# Límite de rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX=100            # 100 requests

# Límite de payload
MAX_PAYLOAD_SIZE=10mb
```

### Microservicio de Socios

Crea un archivo `application-security.properties` en `socios/src/main/resources/`:

```properties
# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:4200,http://localhost:8080
cors.max-age=3600

# Headers de Seguridad
security.headers.frame-options=DENY
security.headers.hsts-max-age=31536000
security.headers.content-security-policy=default-src 'self'
```

## Archivos Modificados

### NestJS
- ✅ `package.json` - Nuevas dependencias
- ✅ `src/main.ts` - Configuración de seguridad
- ✅ `src/common/interceptors/sanitize.interceptor.ts` - Nuevo archivo
- ✅ `src/cuentas/dto/cuenta-request.dto.ts` - Validaciones mejoradas

### Spring Boot
- ✅ `pom.xml` - Nuevas dependencias
- ✅ `src/main/java/.../config/SecurityConfig.java` - Nuevo archivo
- ✅ `src/main/java/.../config/WebMvcConfig.java` - Nuevo archivo
- ✅ `src/main/java/.../interceptor/SecurityInterceptor.java` - Nuevo archivo
- ✅ `src/main/java/.../util/InputSanitizer.java` - Nuevo archivo
- ✅ `src/main/java/.../dto/SocioRequestDTO.java` - Validaciones mejoradas

## Ejecución

### Desarrollo

```bash
# NestJS
cd microservicio-cuentas
npm run start:dev

# Spring Boot
cd socios
./mvnw spring-boot:run
```

### Producción

```bash
# NestJS
cd microservicio-cuentas
npm run build
npm run start:prod

# Spring Boot
cd socios
./mvnw clean package
java -jar target/socios-0.0.1-SNAPSHOT.jar
```

## Logs de Seguridad

Los intentos de ataque se registran automáticamente:

```bash
# Ver logs de NestJS
tail -f microservicio-cuentas/logs/security.log

# Ver logs de Spring Boot
tail -f socios/logs/security.log
```

## Soporte

Para más detalles, consulta:
- 📄 [IMPLEMENTACION_SEGURIDAD.md](./IMPLEMENTACION_SEGURIDAD.md) - Documentación completa

---

**Importante:** Antes de desplegar en producción, asegúrate de:
1. ✅ Configurar HTTPS
2. ✅ Ajustar los orígenes CORS a tus dominios reales
3. ✅ Configurar variables de entorno de producción
4. ✅ Habilitar autenticación JWT/OAuth2
5. ✅ Configurar certificados SSL válidos
