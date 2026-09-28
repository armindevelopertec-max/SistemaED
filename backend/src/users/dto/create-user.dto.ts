import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@smia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nombre Completo' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: Role, example: Role.VISUALIZADOR })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}