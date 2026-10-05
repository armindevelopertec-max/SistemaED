import { IsString, IsNumber, IsOptional, ValidateNested, IsArray } from 'class-validator';
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
  @IsOptional()
  estadoRegistro?: string;

  @IsNumber()
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
