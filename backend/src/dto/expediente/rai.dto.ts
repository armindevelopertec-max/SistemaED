import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateRAIRegistroInicialDto {
  @IsDateString()
  fechaRegistro: string;

  @IsString()
  tecnicoDesignado: string;

  @IsBoolean()
  @IsOptional()
  existeEnArchivo?: boolean;
}

export class CreateRAIHistorialDto {
  @IsString()
  estado: string;

  @IsString()
  causaRazon: string;

  @IsDateString()
  fechaRegistro: string;

  @IsString()
  tecnicoDesignado: string;

  @IsBoolean()
  @IsOptional()
  existeEnArchivo?: boolean;
}
