import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { TramitesService } from './tramites.service';
import { CreateTramiteDto } from './dto/create-tramite.dto';
import { UpdateTramiteDto } from './dto/update-tramite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, EstadoTramite } from '@prisma/client';

@ApiTags('tramites')
@Controller('tramites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TramitesController {
  constructor(private readonly tramitesService: TramitesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo trámite (solo ADMINISTRADOR)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documentos', 10))
  create(
    @Body() createTramiteDto: CreateTramiteDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.tramitesService.create(createTramiteDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los trámites' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoTramite })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('estado') estado?: EstadoTramite,
    @Query('search') search?: string,
  ) {
    return this.tramitesService.findAll({ estado, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de trámites' })
  getStats() {
    return this.tramitesService.getStats();
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar trámite por Hoja de Ruta o Código RAI' })
  buscar(@Query('hojaRuta') hojaRuta?: string, @Query('codigoRai') codigoRai?: string) {
    if (hojaRuta) {
      return this.tramitesService.findByHojaRuta(hojaRuta);
    }
    if (codigoRai) {
      return this.tramitesService.findByCodigoRai(codigoRai);
    }
    return this.tramitesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un trámite por ID' })
  findOne(@Param('id') id: string) {
    return this.tramitesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un trámite (solo ADMINISTRADOR)' })
  update(
    @Param('id') id: string,
    @Body() updateTramiteDto: UpdateTramiteDto,
  ) {
    return this.tramitesService.update(+id, updateTramiteDto);
  }

  @Post(':id/documentos')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Agregar documento a un trámite (solo ADMINISTRADOR)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('archivos', 10))
  addDocumento(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.tramitesService.addDocumento(+id, files[0]);
  }

  @Delete(':id/documentos/:documentoId')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar documento de un trámite (solo ADMINISTRADOR)' })
  removeDocumento(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
  ) {
    return this.tramitesService.removeDocumento(+id, +documentoId);
  }

  @Post(':id/pdf')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Generar PDF del trámite (solo ADMINISTRADOR)' })
  generatePdf(@Param('id') id: string) {
    return this.tramitesService.generatePdf(+id);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un trámite (solo ADMINISTRADOR)' })
  remove(@Param('id') id: string) {
    return this.tramitesService.remove(+id);
  }
}