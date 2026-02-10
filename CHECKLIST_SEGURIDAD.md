# ✅ Checklist de Seguridad

## Pre-Despliegue

### Microservicio de Cuentas (NestJS)

- [ ] Dependencias instaladas: `npm install`
- [ ] Archivo `.env` configurado con variables correctas
- [ ] CORS configurado con orígenes de producción
- [ ] Rate limiting ajustado según tráfico esperado
- [ ] Headers de seguridad verificados
- [ ] Interceptor de sanitización activo
- [ ] Validaciones de DTO probadas
- [ ] Tests de seguridad ejecutados y pasando
- [ ] Logs configurados correctamente
- [ ] Build de producción exitoso: `npm run build`

### Microservicio de Socios (Spring Boot)

- [ ] Dependencias Maven descargadas: `./mvnw clean install`
- [ ] Archivo `application-security.properties` configurado
- [ ] SecurityConfig activo y funcionando
- [ ] Interceptor de seguridad registrado
- [ ] InputSanitizer probado
- [ ] Validaciones Jakarta activas
- [ ] CORS configurado para producción
- [ ] Headers HTTP configurados
- [ ] Tests de integración pasando
- [ ] JAR compilado: `./mvnw package`

## Configuración de Producción

### Infraestructura

- [ ] HTTPS configurado con certificados válidos
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] VPN/VPC configurada para acceso interno
- [ ] Load balancer con SSL termination
- [ ] CDN configurado (si aplica)
- [ ] DNS configurado correctamente
- [ ] Backup automático configurado

### Base de Datos

- [ ] SSL/TLS habilitado en conexiones
- [ ] Usuario con privilegios mínimos
- [ ] Contraseñas seguras configuradas
- [ ] Backup automático configurado
- [ ] Logs de auditoría habilitados
- [ ] Índices optimizados
- [ ] Límites de conexión configurados

### Variables de Entorno

- [ ] `NODE_ENV=production` (NestJS)
- [ ] `SPRING_PROFILES_ACTIVE=prod` (Spring Boot)
- [ ] Secrets almacenados de forma segura (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] JWT_SECRET generado con al menos 256 bits
- [ ] Orígenes CORS configurados con dominios reales
- [ ] Rate limits ajustados
- [ ] Logging level configurado apropiadamente

## Monitoreo

### Logging

- [ ] Logs centralizados (ELK, Splunk, CloudWatch)
- [ ] Logs de seguridad separados
- [ ] Alertas configuradas para:
  - [ ] Múltiples intentos de inyección SQL
  - [ ] Múltiples intentos de XSS
  - [ ] Rate limiting alcanzado frecuentemente
  - [ ] Errores 500 frecuentes
  - [ ] Intentos de acceso no autorizado
- [ ] Rotación de logs configurada
- [ ] Retención de logs según políticas

### Métricas

- [ ] APM configurado (New Relic, Datadog, etc.)
- [ ] Métricas de performance monitoreadas:
  - [ ] Tiempo de respuesta
  - [ ] Tasa de error
  - [ ] Throughput
  - [ ] Uso de CPU/Memoria
- [ ] Alertas configuradas para anomalías
- [ ] Dashboard de métricas accesible

### Seguridad

- [ ] WAF (Web Application Firewall) configurado
- [ ] IDS/IPS configurado
- [ ] Escaneo de vulnerabilidades automatizado
- [ ] Análisis de dependencias (Snyk, Dependabot)
- [ ] Monitoreo de certificados SSL
- [ ] Alertas de seguridad configuradas

## Autenticación y Autorización

### JWT (Para implementar)

- [ ] JWT implementado correctamente
- [ ] Refresh tokens implementados
- [ ] Expiración de tokens configurada
- [ ] Secret keys almacenadas de forma segura
- [ ] Blacklist de tokens revocados
- [ ] Claims mínimos necesarios

### OAuth2/OpenID Connect (Si aplica)

- [ ] Proveedor configurado (Auth0, Okta, etc.)
- [ ] Scopes definidos correctamente
- [ ] Redirect URIs configuradas
- [ ] PKCE habilitado
- [ ] State parameter validado

### Roles y Permisos

- [ ] Roles definidos (ADMIN, USER, etc.)
- [ ] Permisos por endpoint configurados
- [ ] Principio de menor privilegio aplicado
- [ ] Guards/Middlewares de autorización activos

## Pruebas de Seguridad

### Automatizadas

- [ ] Tests unitarios de validación pasando
- [ ] Tests de integración pasando
- [ ] Tests E2E de seguridad pasando
- [ ] Escaneo SAST ejecutado
- [ ] Escaneo DAST ejecutado
- [ ] Análisis de composición de software (SCA)

### Manuales

- [ ] Pruebas de penetración realizadas
- [ ] Revisión de código de seguridad completada
- [ ] Validación de headers HTTP
- [ ] Pruebas de inyección (SQL, XSS, etc.)
- [ ] Pruebas de CSRF
- [ ] Pruebas de autorización
- [ ] Pruebas de rate limiting

## Cumplimiento y Documentación

### Documentación

- [ ] Diagrama de arquitectura actualizado
- [ ] Documentación de API actualizada (Swagger)
- [ ] Documentación de seguridad completa
- [ ] Runbook de incidentes de seguridad
- [ ] Procedimientos de backup y recovery
- [ ] Guías de troubleshooting

### Cumplimiento

- [ ] GDPR compliance (si aplica)
- [ ] PCI DSS compliance (si aplica)
- [ ] HIPAA compliance (si aplica)
- [ ] SOC 2 compliance (si aplica)
- [ ] Política de privacidad publicada
- [ ] Términos de servicio publicados

## Post-Despliegue

### Inmediato (Primeras 24 horas)

- [ ] Verificar que todos los servicios están UP
- [ ] Ejecutar smoke tests
- [ ] Verificar logs de errores
- [ ] Validar métricas iniciales
- [ ] Confirmar que alertas funcionan
- [ ] Verificar backup funcionando

### Primera Semana

- [ ] Monitorear patrones de uso
- [ ] Revisar logs de seguridad
- [ ] Ajustar rate limits si es necesario
- [ ] Optimizar queries lentas
- [ ] Revisar alertas falsas positivas

### Mensual

- [ ] Revisión de logs de seguridad
- [ ] Actualización de dependencias
- [ ] Revisión de métricas de performance
- [ ] Pruebas de backup y recovery
- [ ] Revisión de accesos y permisos

### Trimestral

- [ ] Auditoría de seguridad
- [ ] Pruebas de penetración
- [ ] Revisión de arquitectura
- [ ] Actualización de documentación
- [ ] Capacitación del equipo
- [ ] Revisión de compliance

## Contactos de Emergencia

```
Equipo de Desarrollo: ___________________
Equipo de DevOps: ______________________
Responsable de Seguridad: ______________
Proveedor de Infraestructura: __________
```

## Procedimiento de Rollback

En caso de problemas críticos:

1. [ ] Notificar al equipo
2. [ ] Ejecutar rollback a versión anterior
3. [ ] Verificar que servicios funcionan
4. [ ] Analizar causa raíz
5. [ ] Documentar incidente
6. [ ] Planificar corrección

---

## 📝 Notas

- Este checklist debe ser revisado antes de cada despliegue
- Mantener actualizado con nuevas medidas de seguridad
- Documentar cualquier desviación o excepción
- Realizar auditorías periódicas de este checklist

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Responsable:** _________________
