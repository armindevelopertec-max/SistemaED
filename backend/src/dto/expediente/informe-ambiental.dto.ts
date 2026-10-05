import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class CreateInformeAmbientalAnualDto {
  @IsNumber()
  gestion: number;

  @IsDateString()
  fechaInforme: string;

  @IsArray()
  @IsString({ each: true })
  monitoreos: string[];

  @IsString()
  tecnicoDesignado: string;

  @IsBoolean()
  @IsOptional()
  existeEnArchivo?: boolean;
}
