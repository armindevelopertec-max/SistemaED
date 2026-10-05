import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MinioService } from './minio.service';
import { AuthGuardJwt } from '../auth/guards/jwt-auth.guard';
import { GuardRoles } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('minio')
@Controller('minio')
@UseGuards(AuthGuardJwt, GuardRoles)
@ApiBearerAuth()
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('subir')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Subir un archivo a MinIO (solo ADMINISTRADOR)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async subirArchivo(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = '',
  ) {
    return this.minioService.subirArchivo(file, folder);
  }

  @Get('url/:fileName')
  @ApiOperation({ summary: 'Obtener URL presignada para descargar archivo' })
  async obtenerUrl(@Param('fileName') fileName: string) {
    const url = await this.minioService.obtenerUrlPresignada(decodeURIComponent(fileName));
    return { url };
  }

  @Get('archivos')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todos los archivos en MinIO (solo ADMINISTRADOR)' })
  async listarArchivos(@Body('prefix') prefix: string = '') {
    return this.minioService.listarArchivos(prefix);
  }

  @Delete(':fileName')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un archivo de MinIO (solo ADMINISTRADOR)' })
  async eliminarArchivo(@Param('fileName') fileName: string) {
    await this.minioService.eliminarArchivo(decodeURIComponent(fileName));
    return { message: 'Archivo eliminado correctamente' };
  }
}
