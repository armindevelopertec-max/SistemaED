import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateTramiteDto {
  @ApiProperty({ example: 'HR-2026-001234' })
  @IsString()
  @IsNotEmpty()
  hojaRuta: string;

  @ApiProperty({ example: 'RAI-2026-567890' })
  @IsString()
  @IsNotEmpty()
  codigoRai: string;

  @ApiProperty({ example: 'Certificación de Origen' })
  @IsString()
  @IsNotEmpty()
  nombreTramite: string;

  @ApiProperty({ example: 'Juan Pérez García' })
  @IsString()
  @IsNotEmpty()
  nombreSolicitante: string;

  @ApiProperty({ example: 'Solicitud de certificación para exportación', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  @IsNotEmpty()
  fechaVencimiento: string;

  @ApiProperty({ example: 'Trámite urgente', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}