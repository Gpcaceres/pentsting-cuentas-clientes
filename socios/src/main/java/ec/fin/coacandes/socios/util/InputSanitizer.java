package ec.fin.coacandes.socios.util;

import org.owasp.encoder.Encode;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Utilidad para sanitizar inputs y prevenir ataques de inyección
 * Utiliza OWASP Java Encoder y HTML Sanitizer
 */
@Component
public class InputSanitizer {

    // Política para sanitizar HTML - no permite ningún tag
    private static final PolicyFactory HTML_SANITIZER = new HtmlPolicyBuilder()
            .toFactory();

    // Patrones peligrosos a detectar
    private static final Pattern SCRIPT_PATTERN = Pattern.compile(
            "<script[^>]*>.*?</script>", 
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            ".*(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|eval).*",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Sanitiza un string removiendo HTML y scripts maliciosos
     * 
     * @param input String a sanitizar
     * @return String sanitizado, o null si el input es null
     */
    public String sanitize(String input) {
        if (input == null) {
            return null;
        }

        // Remover scripts
        String cleaned = SCRIPT_PATTERN.matcher(input).replaceAll("");
        
        // Remover HTML malicioso
        cleaned = HTML_SANITIZER.sanitize(cleaned);
        
        // Encode para HTML
        cleaned = Encode.forHtml(cleaned);
        
        // Remover caracteres peligrosos adicionales
        cleaned = cleaned
                .replace("javascript:", "")
                .replace("vbscript:", "")
                .replace("onload=", "")
                .replace("onerror=", "")
                .replace("onclick=", "")
                .trim();

        return cleaned;
    }

    /**
     * Sanitiza un string específicamente para uso en SQL
     * Previene inyección SQL básica
     * 
     * @param input String a sanitizar
     * @return String sanitizado
     */
    public String sanitizeForSql(String input) {
        if (input == null) {
            return null;
        }

        // Primero sanitizar HTML
        String cleaned = sanitize(input);
        
        // Remover caracteres peligrosos para SQL
        cleaned = cleaned
                .replace("'", "")
                .replace("\"", "")
                .replace(";", "")
                .replace("--", "")
                .replace("/*", "")
                .replace("*/", "")
                .replace("xp_", "")
                .replace("sp_", "");

        return cleaned;
    }

    /**
     * Valida si un string contiene patrones de inyección SQL
     * 
     * @param input String a validar
     * @return true si es sospechoso, false si es seguro
     */
    public boolean containsSqlInjection(String input) {
        if (input == null) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(input).matches();
    }

    /**
     * Valida si un string contiene scripts maliciosos
     * 
     * @param input String a validar
     * @return true si contiene scripts, false si no
     */
    public boolean containsScript(String input) {
        if (input == null) {
            return false;
        }
        return SCRIPT_PATTERN.matcher(input).find();
    }

    /**
     * Encode para usar en URLs
     * 
     * @param input String a encodear
     * @return String encodeado para URL
     */
    public String sanitizeForUrl(String input) {
        if (input == null) {
            return null;
        }
        return Encode.forUriComponent(input);
    }

    /**
     * Encode para usar en JavaScript
     * 
     * @param input String a encodear
     * @return String seguro para JavaScript
     */
    public String sanitizeForJavaScript(String input) {
        if (input == null) {
            return null;
        }
        return Encode.forJavaScript(input);
    }
}
