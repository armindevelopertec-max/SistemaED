import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registrar(registroDto: RegistroDto) {
    const usuarioExistente = await this.prisma.user.findUnique({
      where: { email: registroDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registroDto.contrasena, 10);

    const usuario = await this.prisma.user.create({
      data: {
        email: registroDto.email,
        password: hashedPassword,
        nombre: registroDto.nombre,
        role: registroDto.rol,
      },
    });

    const { password, ...result } = usuario;
    return result;
  }

  async inicioSesion(inicioSesionDto: InicioSesionDto) {
    const usuario = await this.prisma.user.findUnique({
      where: { email: inicioSesionDto.email },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(inicioSesionDto.contrasena, usuario.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      nombre: usuario.nombre,
    };

    return {
      token_acceso: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.role,
      },
    };
  }

  async validarUsuario(usuarioId: number) {
    const usuario = await this.prisma.user.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario || !usuario.activo) {
      return null;
    }

    return usuario;
  }
}
