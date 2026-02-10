import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsPositive, 
  IsEnum, 
  IsUUID, 
  Matches, 
  MinLength, 
  MaxLength,
  Min,
  Max,
  IsNotEmpty
} from 'class-validator';
import { Trim } from 'class-sanitizer';

export class CuentaRequestDto {
  @ApiProperty({
    description: 'ID del socio propietario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty({ message: 'El ID del socio es obligatorio' })
  @IsUUID('4', { message: 'El ID del socio debe ser un UUID válido' })
  @Trim()
  socioId: string;

  @ApiProperty({
    description: 'Número de cuenta único',
    example: '001-123456789'
  })
  @IsNotEmpty({ message: 'El número de cuenta es obligatorio' })
  @IsString({ message: 'El número de cuenta debe ser texto' })
  @MinLength(5, { message: 'El número de cuenta debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'El número de cuenta no puede exceder 20 caracteres' })
  @Matches(/^[0-9A-Z\-]+$/, { 
    message: 'El número de cuenta solo puede contener números, letras mayúsculas y guiones' 
  })
  @Trim()
  numeroCuenta: string;

  @ApiProperty({
    description: 'Saldo inicial',
    example: 1000.00,
    minimum: 0,
    maximum: 999999999.99
  })
  @IsNotEmpty({ message: 'El saldo es obligatorio' })
  @IsNumber({}, { message: 'El saldo debe ser un número' })
  @IsPositive({ message: 'El saldo debe ser positivo' })
  @Min(0, { message: 'El saldo mínimo es 0' })
  @Max(999999999.99, { message: 'El saldo máximo es 999,999,999.99' })
  saldo: number;

  @ApiProperty({
    description: 'Tipo de cuenta',
    enum: ['AHORRO', 'CORRIENTE', 'PLAZO_FIJO'],
    example: 'AHORRO'
  })
  @IsNotEmpty({ message: 'El tipo de cuenta es obligatorio' })
  @IsEnum(['AHORRO', 'CORRIENTE', 'PLAZO_FIJO'], { 
    message: 'El tipo de cuenta debe ser AHORRO, CORRIENTE o PLAZO_FIJO' 
  })
  @Trim()
  tipoCuenta: string;
}