package ec.fin.coacandes.socios.interceptor;

import ec.fin.coacandes.socios.util.InputSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor que valida y sanitiza todas las peticiones HTTP
 * Previene inyecciones maliciosas detectando patrones sospechosos
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityInterceptor implements HandlerInterceptor {

    private final InputSanitizer inputSanitizer;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        // Validar parámetros de query
        request.getParameterMap().forEach((key, values) -> {
            for (String value : values) {
                if (inputSanitizer.containsScript(value)) {
                    log.warn("Intento de inyección de script detectado en parámetro: {} = {}", key, value);
                    throw new SecurityException("Script malicioso detectado en los parámetros");
                }
                
                if (inputSanitizer.containsSqlInjection(value)) {
                    log.warn("Intento de inyección SQL detectado en parámetro: {} = {}", key, value);
                    throw new SecurityException("Patrón de inyección SQL detectado");
                }
            }
        });
        
        // Validar headers comunes
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null && inputSanitizer.containsScript(userAgent)) {
            log.warn("Script malicioso en User-Agent: {}", userAgent);
            throw new SecurityException("User-Agent sospechoso");
        }
        
        // Log de seguridad para auditoría
        log.debug("Request validado - Método: {}, URI: {}, IP: {}", 
                request.getMethod(), 
                request.getRequestURI(),
                request.getRemoteAddr());
        
        return true;
    }
}
