# Taller Práctico: Pruebas Unitarias y Coordinación de Microservicios

## **Contexto del Problema**
La Cooperativa de Ahorro y Crédito "Futuro Seguro" ha desarrollado dos microservicios independientes para gestionar socios y cuentas. Sin embargo, estos servicios operan de forma completamente aislada, sin validar la existencia de entidades en el otro sistema. Esto ha generado graves inconsistencias: se pueden crear cuentas para socios inexistentes y eliminar socios que mantienen cuentas activas, comprometiendo la integridad financiera de la institución.

## **Objetivo del Taller**
Implementar pruebas unitarias que validen las dependencias entre microservicios antes de realizar operaciones críticas. Se debe verificar que el microservicio de cuentas consulte la existencia del socio antes de crear cuentas, y que el microservicio de socios verifique cuentas activas antes de eliminar registros. Además, se debe crear un script de Locust que simule eliminaciones masivas concurrentes para evidenciar las inconsistencias.

## **Requisitos Técnicos**
1. **Validación Cross-Service Obligatoria**
* Antes de crear una cuenta: Validar que el socio existe y está activo
* Antes de eliminar un socio: Verificar que no tenga cuentas activas
* Antes de aprobar préstamos: Confirmar que la cuenta destino esté activa
2. **Implementación de Pruebas Unitarias**
Cobertura mínima del 80% en lógica de negocio
* Pruebas que simulen fallos de comunicación entre servicios
* Validación de escenarios de inconsistencia
* Pruebas de concurrencia y condiciones de carrera
3. **Script Locust para Simulación**
Simular 100 usuarios concurrentes realizando eliminaciones
* Generar reporte de inconsistencias encontradas
* Demostrar el problema antes de implementar validaciones
* Medir impacto en performance después de las correcciones

## **Problemas Críticos a Resolver**

| Problema | Microservicio | Consecuencia | Estado Inicial |
|----------|---------------|--------------|----------------|
| **Cuentas para socios inexistentes** | Cuentas (NestJS) | Fraude, imposible cobrar débitos | ❌ No valida |
| **Eliminación de socios con cuentas activas** | Socios (Spring Boot) | Cuentas huérfanas, pérdida de fondos | ❌ No verifica |
| **Aprobación de préstamos sin validación** | Ambos microservicios | Créditos a cuentas canceladas o inexistentes | ❌ Sin coordinación |
| **Falta de transacciones distribuidas** | Sistema completo | Inconsistencia de datos garantizada | ❌ Sin rollback |
| **Doble gasto en operaciones concurrentes** | Ambos microservicios | Saldos negativos no detectados | ❌ Sin bloqueos |
| **Auditoría desincronizada** | Sistema completo | Imposible rastrear operaciones | ❌ Logs separados |

## **Objetivos de las Pruebas Unitarias**

| Tipo de Prueba | Microservicio | Validación Requerida |
|----------------|---------------|----------------------|
| **Validación cross-service** | Cuentas → Socios | Verificar existencia del socio antes de crear cuenta |
| **Validación cross-service** | Socios → Cuentas | Verificar cuentas activas antes de eliminar socio |
| **Pruebas de concurrencia** | Ambos | Manejo de operaciones simultáneas |
| **Pruebas de resiliencia** | Ambos | Comportamiento ante fallos del otro servicio |
| **Pruebas de idempotencia** | Ambos | Múltiples llamadas con mismo efecto |

## **Métricas de Validación**

| Métrica | Valor Antes | Valor Objetivo | Herramienta |
|---------|-------------|----------------|-------------|
| **Inconsistencias detectadas** | 0% | 100% | Pruebas unitarias |
| **Tiempo respuesta cross-service** | N/A | < 200ms | Locust |
| **Cobertura de código** | N/A | > 80% | Jest/JUnit |
| **Préstamos huérfanos** | Alto | 0 | Validación manual |
| **Saldos negativos** | Permitidos | Bloqueados | Pruebas de regresión |

---

## 🔐 Seguridad

Este proyecto ha sido securizado contra vulnerabilidades comunes (OWASP Top 10). 

### Documentación de Seguridad

- 📄 **[IMPLEMENTACION_SEGURIDAD.md](./IMPLEMENTACION_SEGURIDAD.md)** - Documentación completa de todas las medidas implementadas
- 📘 **[SEGURIDAD_README.md](./SEGURIDAD_README.md)** - Guía rápida de instalación y configuración
- 🧪 **[PRUEBAS_SEGURIDAD.md](./PRUEBAS_SEGURIDAD.md)** - Scripts para probar las medidas de seguridad
- ✅ **[CHECKLIST_SEGURIDAD.md](./CHECKLIST_SEGURIDAD.md)** - Checklist pre-despliegue

### Medidas Implementadas

- ✅ **Headers de Seguridad HTTP** (Helmet, Spring Security Headers)
- ✅ **Rate Limiting** (Prevención DoS y fuerza bruta)
- ✅ **CORS Configurado** (Orígenes y métodos restringidos)
- ✅ **Sanitización de Inputs** (Prevención XSS e inyección SQL)
- ✅ **Validaciones Estrictas** (class-validator, Jakarta Validation)
- ✅ **Interceptores de Seguridad** (Detección de patrones maliciosos)
- ✅ **Límites de Payload** (Prevención de ataques DoS)
- ✅ **Logging de Seguridad** (Auditoría de intentos de ataque)

### Instalación Rápida

```bash
# Microservicio de Cuentas (NestJS)
cd microservicio-cuentas
npm install
cp .env.example .env
npm run start:dev

# Microservicio de Socios (Spring Boot)
cd socios
./mvnw clean install
./mvnw spring-boot:run
```

Para más detalles, consulta la [documentación de seguridad](./IMPLEMENTACION_SEGURIDAD.md).

---
