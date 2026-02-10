package ec.fin.coacandes.socios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(description = "DTO para creación y actualización de socios")
public class SocioRequestDTO {

    @NotBlank(message = "La identificación es obligatoria")
    @Pattern(regexp = "^[0-9]{10,13}$", message = "Identificación inválida - debe contener solo números (10-13 dígitos)")
    @Schema(description = "Cédula (10 dígitos) o RUC (13 dígitos)", example = "1712345678")
    private String identificacion;

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 2, max = 100, message = "Los nombres deben tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "Los nombres solo pueden contener letras y espacios")
    @Schema(example = "Juan Carlos")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(min = 2, max = 100, message = "Los apellidos deben tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "Los apellidos solo pueden contener letras y espacios")
    @Schema(example = "Pérez González")
    private String apellidos;

    @Email(message = "Email inválido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    @Schema(example = "juan.perez@email.com")
    private String email;

    @Pattern(regexp = "^[0-9]{9,10}$", message = "Teléfono inválido - debe contener 9 o 10 dígitos")
    @Schema(example = "0987654321")
    private String telefono;

    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,#\\-]+$", message = "La dirección contiene caracteres no permitidos")
    @Schema(example = "Av. Principal 123")
    private String direccion;

    @NotNull(message = "El tipo de identificación es obligatorio")
    @Pattern(regexp = "^(CEDULA|RUC)$", message = "El tipo de identificación debe ser CEDULA o RUC")
    @Schema(example = "CEDULA", allowableValues = {"CEDULA", "RUC"})
    private String tipoIdentificacion;
}

