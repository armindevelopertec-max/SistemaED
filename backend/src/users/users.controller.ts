import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuardJwt } from '../auth/guards/jwt-auth.guard';
import { GuardRoles } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuardJwt, GuardRoles)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo usuario (solo ADMINISTRADOR)' })
  crear(@Body() createUserDto: CreateUserDto) {
    return this.usuariosService.crear(createUserDto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todos los usuarios (solo ADMINISTRADOR)' })
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.obtenerUno(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un usuario (solo ADMINISTRADOR)' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usuariosService.actualizar(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar un usuario (solo ADMINISTRADOR)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}
