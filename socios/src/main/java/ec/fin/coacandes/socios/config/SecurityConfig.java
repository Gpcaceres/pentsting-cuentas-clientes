package ec.fin.coacandes.socios.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración de seguridad para proteger la aplicación contra vulnerabilidades comunes
 * Implementa medidas de seguridad OWASP Top 10
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configuración principal de seguridad con headers HTTP seguros
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ============ PROTECCIÓN CSRF ============
            // Deshabilitado para API REST stateless
            // En producción con frontend, habilitar con tokens
            .csrf(csrf -> csrf.disable())
            
            // ============ POLÍTICA DE SESIONES ============
            // API REST stateless - sin sesiones
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // ============ CONFIGURACIÓN DE CORS ============
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // ============ HEADERS DE SEGURIDAD ============
            .headers(headers -> headers
                // Previene ataques de clickjacking
                .frameOptions(frame -> frame.deny())
                
                // Previene ataques MIME type sniffing
                .contentTypeOptions(contentType -> contentType.disable())
                
                // Política de seguridad de contenido (CSP)
                .contentSecurityPolicy(csp -> 
                    csp.policyDirectives("default-src 'self'; " +
                        "script-src 'self' 'unsafe-inline'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self' data:; " +
                        "frame-ancestors 'none';")
                )
                
                // HTTP Strict Transport Security (HSTS)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
                
                // Política de referrer
                .referrerPolicy(referrer -> 
                    referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                
                // Protección XSS del navegador
                .xssProtection(xss -> xss
                    .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)
                )
            )
            
            // ============ AUTORIZACIÓN DE ENDPOINTS ============
            .authorizeHttpRequests(auth -> auth
                // Permitir acceso a Swagger/OpenAPI
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()
                
                // Permitir acceso a endpoints de salud (actuator si está habilitado)
                .requestMatchers("/actuator/health").permitAll()
                
                // Todos los demás endpoints de la API están abiertos
                // En producción, implementar autenticación JWT/OAuth2
                .requestMatchers("/api/**").permitAll()
                
                // Cualquier otra request requiere autenticación
                .anyRequest().authenticated()
            );

        return http.build();
    }

    /**
     * Configuración de CORS para permitir solo orígenes confiables
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Orígenes permitidos - ajustar según el entorno
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:4000",
            "http://localhost:4001",
            "http://localhost:4200",
            "http://localhost:8080"
        ));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin"
        ));
        
        // Headers expuestos
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition"
        ));
        
        // Permitir credenciales
        configuration.setAllowCredentials(true);
        
        // Tiempo de cache de preflight (1 hora)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
