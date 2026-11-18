import { IsString, IsNumber, IsOptional, ValidateNested, IsArray, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class RepresentanteLegalDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  ci?: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}

class RubroActividadDto {
  @IsString()
  @IsOptional()
  codigoCaeb?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  categoria?: number;
}

export class UpdateUnidadIndustrialDto {
  @IsString()
  @IsOptional()
  codigoRai?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  razonSocial?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsNumber()
  @Min(1)
  @Max(14)
  @IsOptional()
  distrito?: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsNumber()
  @IsOptional()
  msnm?: number;

  @IsString()
  @IsOptional()
  faseActividad?: string;

  @IsString()
  @IsIn(['VIGENTE', 'CADUCO', 'ANULADO', 'CIERRE'])
  @IsOptional()
  estadoRegistro?: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  categoriaFinal?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => RepresentanteLegalDto)
  representanteLegal?: RepresentanteLegalDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubroActividadDto)
  @IsOptional()
  rubrosActividad?: RubroActividadDto[];
}
