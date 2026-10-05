import { IsString, IsNumber, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class RepresentanteLegalDto {
  @IsString()
  nombre: string;

  @IsString()
  ci: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}

class RubroActividadDto {
  @IsString()
  codigoCaeb: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  categoria: number;
}

export class CreateUnidadIndustrialDto {
  @IsString()
  codigoRai: string;

  @IsString()
  nombre: string;

  @IsString()
  razonSocial: string;

  @IsString()
  direccion: string;

  @IsNumber()
  distrito: number;

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
