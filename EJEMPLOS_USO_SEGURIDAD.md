# 💻 Ejemplos de Uso - Seguridad

Este documento contiene ejemplos prácticos de cómo utilizar las funciones de seguridad implementadas.

---

## 🟦 NestJS - Microservicio de Cuentas

### 1. Uso del Interceptor de Sanitización

El interceptor se aplica automáticamente a todas las peticiones. No requiere configuración adicional.

```typescript
// Los inputs se sanitizan automáticamente antes de llegar al controller

@Post()
async crearCuenta(@Body() request: CuentaRequestDto) {
  // request.numeroCuenta ya está sanitizado
  // Si contenía <script>, ha sido removido
  return this.cuentasService.crearCuenta(request);
}
```

### 2. Validaciones en DTOs

```typescript
import { 
  IsNotEmpty, 
  IsUUID, 
  Matches, 
  MinLength, 
  MaxLength 
} from 'class-validator';
import { Trim } from 'class-sanitizer';

export class CuentaRequestDto {
  // Valida UUID v4
  @IsUUID('4', { message: 'El ID debe ser un UUID válido' })
  @Trim() // Remueve espacios antes/después
  socioId: string;

  // Solo permite números, letras mayúsculas y guiones
  @Matches(/^[0-9A-Z\-]+$/, { 
    message: 'Solo números, letras mayúsculas y guiones' 
  })
  @MinLength(5)
  @MaxLength(20)
  @Trim()
  numeroCuenta: string;

  // Valida que sea número positivo entre 0 y 999,999,999.99
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Max(999999999.99)
  saldo: number;

  // Valida que sea uno de los valores del enum
  @IsEnum(['AHORRO', 'CORRIENTE', 'PLAZO_FIJO'])
  tipoCuenta: string;
}
```

### 3. Manejo de Errores de Validación

```typescript
// NestJS lanza automáticamente ValidationError
// Respuesta típica:

{
  "statusCode": 400,
  "message": [
    "El ID debe ser un UUID válido",
    "Solo números, letras mayúsculas y guiones",
    "El saldo debe ser positivo"
  ],
  "error": "Bad Request"
}
```

### 4. Configuración Personalizada de Rate Limiting

```typescript
// src/main.ts

// Rate limit global
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 100,                   // 100 requests
    message: 'Demasiadas peticiones',
  }),
);

// Rate limit específico para login (más estricto)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Solo 5 intentos
  message: 'Demasiados intentos de login',
});

app.use('/auth/login', loginLimiter);
```

### 5. Sanitización Manual (Si se necesita)

```typescript
import * as xss from 'xss';

// En un servicio
sanitizeInput(input: string): string {
  return xss(input, {
    whiteList: {},  // No permite ningún tag HTML
    stripIgnoreTag: true,
  });
}

// Uso
const cleaned = this.sanitizeInput(userInput);
```

---

## 🟩 Spring Boot - Microservicio de Socios

### 1. Uso del InputSanitizer

```java
import ec.fin.coacandes.socios.util.InputSanitizer;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocioServiceImpl implements SocioService {
    
    private final InputSanitizer inputSanitizer;
    
    @Override
    public SocioResponseDTO crearSocio(SocioRequestDTO request) {
        // Sanitizar inputs antes de guardar
        String nombresSanitizados = inputSanitizer.sanitize(request.getNombres());
        String apellidosSanitizados = inputSanitizer.sanitize(request.getApellidos());
        
        // Verificar si contiene patrones maliciosos
        if (inputSanitizer.containsScript(request.getNombres())) {
            throw new SecurityException("Script detectado en nombres");
        }
        
        if (inputSanitizer.containsSqlInjection(request.getApellidos())) {
            throw new SecurityException("SQL injection detectado");
        }
        
        // Continuar con lógica de negocio...
        Socio socio = new Socio();
        socio.setNombres(nombresSanitizados);
        socio.setApellidos(apellidosSanitizados);
        
        return mapper.map(repository.save(socio), SocioResponseDTO.class);
    }
}
```

### 2. Validaciones en DTOs

```java
import jakarta.validation.constraints.*;

@Data
public class SocioRequestDTO {
    
    // Validación de cédula ecuatoriana (10 dígitos)
    @NotBlank(message = "La identificación es obligatoria")
    @Pattern(regexp = "^[0-9]{10,13}$", 
             message = "Debe contener 10-13 dígitos")
    private String identificacion;
    
    // Solo letras y espacios, 2-100 caracteres
    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 2, max = 100, 
          message = "Entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", 
             message = "Solo letras y espacios")
    private String nombres;
    
    // Email válido
    @Email(message = "Email inválido")
    @Size(max = 100)
    private String email;
    
    // Teléfono ecuatoriano (9-10 dígitos)
    @Pattern(regexp = "^[0-9]{9,10}$", 
             message = "9-10 dígitos")
    private String telefono;
    
    // Enum estricto
    @NotNull
    @Pattern(regexp = "^(CEDULA|RUC)$")
    private String tipoIdentificacion;
}
```

### 3. Manejo de Errores de Validación

```java
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.FieldError;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("Validation failed", errors));
    }
    
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurityErrors(
            SecurityException ex) {
        
        // Log del intento de ataque
        log.warn("Security exception: {}", ex.getMessage());
        
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("Security violation detected", null));
    }
}
```

### 4. InputSanitizer - Métodos Disponibles

```java
@Autowired
private InputSanitizer inputSanitizer;

// 1. Sanitización HTML general
String clean = inputSanitizer.sanitize("<script>alert(1)</script>");
// Resultado: "&lt;script&gt;alert(1)&lt;/script&gt;"

// 2. Sanitización específica para SQL
String sqlSafe = inputSanitizer.sanitizeForSql("'; DROP TABLE users;--");
// Resultado: "  DROP TABLE users--" (caracteres peligrosos removidos)

// 3. Detectar inyección SQL
boolean isSqlInjection = inputSanitizer.containsSqlInjection(
    "SELECT * FROM users WHERE id = 1 OR 1=1"
);
// Resultado: true

// 4. Detectar scripts
boolean hasScript = inputSanitizer.containsScript(
    "<script>alert('XSS')</script>"
);
// Resultado: true

// 5. Sanitizar para URLs
String urlSafe = inputSanitizer.sanitizeForUrl("param=value&other=<script>");
// Resultado: "param%3Dvalue%26other%3D%3Cscript%3E"

// 6. Sanitizar para JavaScript
String jsSafe = inputSanitizer.sanitizeForJavaScript("'; alert(1); '");
// Resultado: "\\x27; alert(1); \\x27"
```

### 5. Interceptor de Seguridad

El interceptor valida automáticamente todas las peticiones:

```java
// No requiere código adicional
// Se ejecuta automáticamente en cada request a /api/**

// Si detecta algo malicioso, lanza SecurityException:

GET /api/socios?nombre=<script>alert(1)</script>

↓ SecurityInterceptor detecta script
↓ Log: "Intento de inyección de script detectado"
↓ Lanza SecurityException

Respuesta: 403 Forbidden
{
  "message": "Script malicioso detectado en los parámetros",
  "timestamp": "2026-01-27T12:00:00"
}
```

---

## 🔧 Configuración Avanzada

### NestJS - Múltiples Rate Limiters

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // Rate limiter global
    ThrottlerModule.forRoot({
      ttl: 60,    // 60 segundos
      limit: 10,  // 10 requests
    }),
  ],
})
export class AppModule {}

// En un controller específico
@UseGuards(ThrottlerGuard)
@Throttle(5, 60)  // Override: 5 requests en 60 segundos
@Controller('auth')
export class AuthController {
  // Endpoints protegidos...
}
```

### Spring Boot - Configuración CORS Dinámica

```java
@Configuration
public class SecurityConfig {
    
    @Value("${security.cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Orígenes desde application.properties
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        
        // Métodos permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH"
        ));
        
        // Headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = 
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
```

```properties
# application.properties
security.cors.allowed-origins=http://localhost:3000,http://localhost:4200
```

---

## 🧪 Testing de Seguridad

### NestJS - Test de Validación

```typescript
describe('CuentasController', () => {
  it('should reject XSS in socioId', async () => {
    const maliciousDto = {
      socioId: '<script>alert("XSS")</script>',
      numeroCuenta: '001-123456',
      saldo: 1000,
      tipoCuenta: 'AHORRO',
    };

    await request(app.getHttpServer())
      .post('/cuentas')
      .send(maliciousDto)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('UUID válido');
      });
  });
});
```

### Spring Boot - Test de Sanitización

```java
@SpringBootTest
class InputSanitizerTest {
    
    @Autowired
    private InputSanitizer inputSanitizer;
    
    @Test
    void shouldDetectXSS() {
        String malicious = "<script>alert('XSS')</script>";
        assertTrue(inputSanitizer.containsScript(malicious));
    }
    
    @Test
    void shouldDetectSQLInjection() {
        String malicious = "1' OR '1'='1";
        assertTrue(inputSanitizer.containsSqlInjection(malicious));
    }
    
    @Test
    void shouldSanitizeHTML() {
        String malicious = "<b>Bold</b><script>alert(1)</script>";
        String sanitized = inputSanitizer.sanitize(malicious);
        assertFalse(sanitized.contains("<script>"));
    }
}
```

---

## 📝 Buenas Prácticas

### ✅ DO - Hacer

```typescript
// ✅ Siempre validar en el DTO
@IsString()
@IsNotEmpty()
@Matches(/^[a-zA-Z0-9]+$/)
nombre: string;

// ✅ Sanitizar inputs del usuario
const clean = this.sanitizer.sanitize(userInput);

// ✅ Usar validaciones específicas
@IsEmail()
email: string;

// ✅ Limitar tamaños
@MaxLength(100)
descripcion: string;

// ✅ Whitelist de valores
@IsEnum(['ACTIVO', 'INACTIVO'])
estado: string;
```

### ❌ DON'T - No Hacer

```typescript
// ❌ No confiar en inputs del cliente
const cuenta = request.body;  // Sin validación

// ❌ No construir SQL manualmente
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ❌ No deshabilitar validación
@ValidateNested({ skipMissingProperties: true })  // Inseguro

// ❌ No permitir todos los orígenes
app.enableCors({ origin: '*' });  // Peligroso

// ❌ No exponer información sensible en errores
throw new Error(`Password is: ${password}`);  // Nunca
```

---

## 🔍 Debugging

### Ver Logs de Seguridad

```bash
# NestJS
tail -f logs/security.log | grep "WARN\|ERROR"

# Spring Boot
tail -f logs/security.log | grep "SecurityInterceptor"

# Ver intentos de XSS
grep "XSS" logs/security.log

# Ver intentos de SQL injection
grep "SQL injection" logs/security.log
```

### Verificar Headers

```bash
# Verificar todos los headers de seguridad
curl -I http://localhost:3000/api/cuentas | grep -E "X-|Content-Security|Strict-Transport"
```

---

## 📚 Referencias

- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [Spring Validation](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#validation)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0
