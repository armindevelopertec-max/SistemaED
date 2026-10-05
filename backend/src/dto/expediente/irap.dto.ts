import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class CreateIRAPCategoria3Dto {
  @IsString()
  documentoAmbiental: string;

  @IsDateString()
  fechaInforme: string;

  @IsString()
  estado: string;

  @IsString()
  @IsOptional()
  certificadoAprobacion?: string;

  @IsString()
  tecnicoDesignado: string;

  @IsBoolean()
  @IsOptional()
  existeEnArchivo?: boolean;
}

export class CreateIRAPCategoria12Dto {
  @IsString()
  documentoAmbiental: string;

  @IsDateString()
  fechaInforme: string;

  @IsString()
  estado: string;

  @IsString()
  @IsOptional()
  certificadAprobacion?: string;

  @IsString()
  @IsOptional()
  remisionDocumento?: string;

  @IsString()
  @IsOptional()
  daa?: string;

  @IsDateString()
  @IsOptional()
  fechaDaa?: string;

  @IsString()
  tecnicoDesignado: string;

  @IsBoolean()
  @IsOptional()
  existeEnArchivo?: boolean;
}
