import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async crear(createUserDto: CreateUserDto) {
    const usuarioExistente = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.contrasena, 10);

    const usuario = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        nombre: createUserDto.nombre,
        role: createUserDto.rol,
      },
    });

    const { password, ...result } = usuario;
    return result;
  }

  async listar() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async obtenerUno(id: number) {
    const usuario = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async actualizar(id: number, updateUserDto: any) {
    const usuario = await this.prisma.user.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const data: any = { ...updateUserDto };
    if (data.rol) {
      data.role = data.rol;
      delete data.rol;
    }

    if (updateUserDto.contrasena) {
      data.password = await bcrypt.hash(updateUserDto.contrasena, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async eliminar(id: number) {
    const usuario = await this.prisma.user.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Usuario desactivado correctamente' };
  }
}
