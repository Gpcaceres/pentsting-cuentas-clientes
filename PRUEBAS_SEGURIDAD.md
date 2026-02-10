# 🧪 Scripts de Prueba de Seguridad

Este archivo contiene comandos para probar las medidas de seguridad implementadas.

## Requisitos Previos

```bash
# Asegúrate de tener ambos microservicios ejecutándose:
# Terminal 1 - NestJS
cd microservicio-cuentas
npm run start:dev

# Terminal 2 - Spring Boot
cd socios
./mvnw spring-boot:run
```

---

## 1️⃣ Pruebas de Inyección XSS

### Test 1: Script Tag en Body

```bash
curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "<script>alert(\"XSS\")</script>",
    "numeroCuenta": "001-123456",
    "saldo": 1000,
    "tipoCuenta": "AHORRO"
  }'
```

**Resultado Esperado:** ❌ Error de validación (UUID inválido) o input sanitizado

### Test 2: Event Handler en String

```bash
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "identificacion": "1712345678",
    "nombres": "Juan<img src=x onerror=alert(1)>",
    "apellidos": "Pérez",
    "email": "juan@test.com",
    "telefono": "0987654321",
    "tipoIdentificacion": "CEDULA"
  }'
```

**Resultado Esperado:** ❌ Error de validación (caracteres no permitidos)

### Test 3: JavaScript Protocol

```bash
curl -X PUT http://localhost:3000/api/cuentas/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "javascript:alert(\"XSS\")",
    "numeroCuenta": "001-123456",
    "saldo": 1000,
    "tipoCuenta": "AHORRO"
  }'
```

**Resultado Esperado:** ❌ Error de validación (UUID inválido)

---

## 2️⃣ Pruebas de Inyección SQL

### Test 4: SQL en Parámetro de Query

```bash
# Intento de obtener todos los registros
curl "http://localhost:8080/api/socios/identificacion/1712345678'%20OR%20'1'='1"
```

**Resultado Esperado:** ❌ 400 Bad Request - "Patrón SQL detectado"

### Test 5: UNION Attack

```bash
curl "http://localhost:3000/api/cuentas/socio/123e4567' UNION SELECT * FROM users--"
```

**Resultado Esperado:** ❌ Error de validación o seguridad

### Test 6: DROP TABLE

```bash
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "identificacion": "1712345678",
    "nombres": "Juan",
    "apellidos": "Pérez; DROP TABLE socios;--",
    "email": "juan@test.com",
    "tipoIdentificacion": "CEDULA"
  }'
```

**Resultado Esperado:** ❌ Error de validación (caracteres especiales no permitidos)

---

## 3️⃣ Pruebas de Rate Limiting

### Test 7: Exceder Límite de Requests

```bash
# Ejecutar 101 requests en menos de 15 minutos
for i in {1..101}
do
  echo "Request #$i"
  curl -s http://localhost:3000/api/cuentas | head -n 1
  sleep 0.1
done
```

**Resultado Esperado:** 
- ✅ Requests 1-100: 200 OK
- ❌ Request 101+: 429 Too Many Requests

### Test 8: Múltiples IPs (Simulado con diferentes User-Agents)

```bash
# Request 1
curl -H "User-Agent: Browser1" http://localhost:3000/api/cuentas

# Request 2
curl -H "User-Agent: Browser2" http://localhost:3000/api/cuentas
```

**Resultado Esperado:** ✅ Ambos deberían funcionar (diferentes contextos)

---

## 4️⃣ Pruebas de Headers de Seguridad

### Test 9: Verificar Headers HTTP

```bash
curl -I http://localhost:3000/api/cuentas
```

**Headers Esperados:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
```

### Test 10: Headers en Spring Boot

```bash
curl -I http://localhost:8080/api/socios
```

**Headers Esperados:** (similares a los de NestJS)

---

## 5️⃣ Pruebas de CORS

### Test 11: Origen No Autorizado

```bash
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/cuentas
```

**Resultado Esperado:** ❌ Sin header `Access-Control-Allow-Origin`

### Test 12: Origen Autorizado

```bash
curl -H "Origin: http://localhost:4200" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/cuentas
```

**Resultado Esperado:** ✅ Header `Access-Control-Allow-Origin: http://localhost:4200`

---

## 6️⃣ Pruebas de Validación de Datos

### Test 13: Datos Inválidos - UUID

```bash
curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "no-es-un-uuid",
    "numeroCuenta": "001-123456",
    "saldo": 1000,
    "tipoCuenta": "AHORRO"
  }'
```

**Resultado Esperado:** ❌ 400 Bad Request - "UUID inválido"

### Test 14: Datos Inválidos - Números Negativos

```bash
curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "123e4567-e89b-12d3-a456-426614174000",
    "numeroCuenta": "001-123456",
    "saldo": -1000,
    "tipoCuenta": "AHORRO"
  }'
```

**Resultado Esperado:** ❌ 400 Bad Request - "Saldo debe ser positivo"

### Test 15: Datos Inválidos - Enum

```bash
curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "123e4567-e89b-12d3-a456-426614174000",
    "numeroCuenta": "001-123456",
    "saldo": 1000,
    "tipoCuenta": "TIPO_INVALIDO"
  }'
```

**Resultado Esperado:** ❌ 400 Bad Request - "Tipo de cuenta inválido"

### Test 16: Campos Extra No Permitidos

```bash
curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "123e4567-e89b-12d3-a456-426614174000",
    "numeroCuenta": "001-123456",
    "saldo": 1000,
    "tipoCuenta": "AHORRO",
    "campoMalicioso": "valor no permitido"
  }'
```

**Resultado Esperado:** ❌ 400 Bad Request - "Propiedades no permitidas"

---

## 7️⃣ Pruebas de Payload

### Test 17: Payload Muy Grande

```bash
# Crear un archivo con 15MB de datos
dd if=/dev/zero of=large.json bs=1M count=15

curl -X POST http://localhost:3000/api/cuentas \
  -H "Content-Type: application/json" \
  --data-binary @large.json
```

**Resultado Esperado:** ❌ 413 Payload Too Large

### Test 18: String Extremadamente Largo

```bash
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d "{
    \"identificacion\": \"1712345678\",
    \"nombres\": \"$(python3 -c 'print("A"*10000)')\",
    \"apellidos\": \"Pérez\",
    \"tipoIdentificacion\": \"CEDULA\"
  }"
```

**Resultado Esperado:** ❌ 400 Bad Request - "Excede límite de caracteres"

---

## 8️⃣ Pruebas de Patrones de Validación

### Test 19: Teléfono Inválido

```bash
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "identificacion": "1712345678",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@test.com",
    "telefono": "abc1234567",
    "tipoIdentificacion": "CEDULA"
  }'
```

**Resultado Esperado:** ❌ 400 Bad Request - "Teléfono inválido"

### Test 20: Email Inválido

```bash
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "identificacion": "1712345678",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "no-es-un-email",
    "tipoIdentificacion": "CEDULA"
  }'
```

**Resultado Esperado:** ❌ 400 Bad Request - "Email inválido"

---

## 🎯 Resumen de Resultados

Después de ejecutar todas las pruebas, deberías tener:

| Test | Categoría | Resultado Esperado |
|------|-----------|-------------------|
| 1-3 | XSS | ❌ Bloqueado |
| 4-6 | SQL Injection | ❌ Bloqueado |
| 7-8 | Rate Limiting | ❌ Bloqueado después del límite |
| 9-10 | Headers | ✅ Todos presentes |
| 11-12 | CORS | ❌/✅ Según origen |
| 13-16 | Validación | ❌ Rechazado |
| 17-18 | Payload | ❌ Rechazado |
| 19-20 | Patrones | ❌ Rechazado |

---

## 📊 Script Automatizado

Guarda este script como `test-security.sh`:

```bash
#!/bin/bash

echo "🔐 Iniciando pruebas de seguridad..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Contador
PASSED=0
FAILED=0

# Función para probar
test_endpoint() {
  local name=$1
  local expected=$2
  local response=$(eval $3)
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC}: $name"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $name"
    ((FAILED++))
  fi
}

# Ejecutar pruebas
test_endpoint "XSS Protection" "400\|UUID" "curl -s -w '%{http_code}' -X POST http://localhost:3000/api/cuentas -H 'Content-Type: application/json' -d '{\"socioId\":\"<script>alert(1)</script>\"}'"

test_endpoint "Rate Limiting Headers" "X-Frame-Options" "curl -I http://localhost:3000/api/cuentas"

# ... más pruebas ...

echo ""
echo "📊 Resultados: ${GREEN}$PASSED Pasadas${NC} | ${RED}$FAILED Fallidas${NC}"
```

---

## 🆘 Troubleshooting

### Problema: "Cannot connect to localhost"
**Solución:** Asegúrate de que ambos servicios estén ejecutándose.

### Problema: "Headers no aparecen"
**Solución:** Verifica que las dependencias se hayan instalado correctamente.

### Problema: "Rate limiting no funciona"
**Solución:** El rate limiting es por IP. Espera 15 minutos o reinicia el servidor.

---

**Nota:** Estos tests son para ambiente de desarrollo. En producción, usar herramientas profesionales como:
- OWASP ZAP
- Burp Suite
- Postman con colecciones de seguridad
- JMeter para stress testing
