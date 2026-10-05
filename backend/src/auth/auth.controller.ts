import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { RegistroDto } from './dto/registro.dto';
import { AuthGuardJwt } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('inicio-sesion')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async inicioSesion(@Body() inicioSesionDto: InicioSesionDto) {
    return this.authService.inicioSesion(inicioSesionDto);
  }

  @Post('registrar')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async registrar(@Body() registroDto: RegistroDto) {
    return this.authService.registrar(registroDto);
  }

  @Get('perfil')
  @UseGuards(AuthGuardJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async obtenerPerfil(@Request() req: any) {
    return req.user;
  }
}