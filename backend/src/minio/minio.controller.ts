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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('minio')
@Controller('minio')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Subir un archivo a MinIO (solo ADMINISTRADOR)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = '',
  ) {
    return this.minioService.uploadFile(file, folder);
  }

  @Get('url/:fileName')
  @ApiOperation({ summary: 'Obtener URL presignada para descargar archivo' })
  async getUrl(@Param('fileName') fileName: string) {
    const url = await this.minioService.getPresignedUrl(decodeURIComponent(fileName));
    return { url };
  }

  @Get('files')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todos los archivos en MinIO (solo ADMINISTRADOR)' })
  async listFiles(@Body('prefix') prefix: string = '') {
    return this.minioService.listFiles(prefix);
  }

  @Delete(':fileName')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un archivo de MinIO (solo ADMINISTRADOR)' })
  async deleteFile(@Param('fileName') fileName: string) {
    await this.minioService.deleteFile(decodeURIComponent(fileName));
    return { message: 'Archivo eliminado correctamente' };
  }
}