import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateRubroActividadDto {
  @IsString()
  codigoCaeb: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  categoria: number;
}

export class UpdateRubroActividadDto {
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
