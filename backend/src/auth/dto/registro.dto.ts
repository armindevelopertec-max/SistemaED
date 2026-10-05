import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegistroDto {
  @ApiProperty({ example: 'admin@smia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: Role, example: Role.ADMINISTRADOR })
  @IsEnum(Role)
  @IsOptional()
  rol?: Role;
}
