import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpedienteService } from '../services/expediente.service';
import {
  CreateUnidadIndustrialDto,
  UpdateUnidadIndustrialDto,
} from '../dto/expediente';
import {
  CreateRAIRegistroInicialDto,
  CreateRAIHistorialDto,
} from '../dto/expediente/rai.dto';
import { CreateIRAPCategoria3Dto } from '../dto/expediente/irap.dto';
import { CreateIRAPCategoria12Dto } from '../dto/expediente/irap.dto';
import { CreateInformeAmbientalAnualDto } from '../dto/expediente/informe-ambiental.dto';
import { AuthGuardJwt } from '../auth/guards/jwt-auth.guard';
import { GuardRoles } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('expediente')
@UseGuards(AuthGuardJwt, GuardRoles)
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  @Get('unidades-industriales')
  async getAllUnidadesIndustriales(@Query('buscar') buscar?: string) {
    return this.expedienteService.getAllUnidadesIndustriales(buscar);
  }

  @Get('unidades-industriales/:id')
  async getUnidadIndustrial(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.getUnidadIndustrial(id);
  }

  @Post('unidades-industriales')
  @Roles(Role.ADMINISTRADOR)
  async createUnidadIndustrial(
    @Body() dto: CreateUnidadIndustrialDto,
  ) {
    return this.expedienteService.createUnidadIndustrial(dto);
  }

  @Patch('unidades-industriales/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateUnidadIndustrial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadIndustrialDto,
  ) {
    return this.expedienteService.updateUnidadIndustrial(id, dto);
  }

  @Delete('unidades-industriales/:id')
  @Roles(Role.ADMINISTRADOR)
  async deleteUnidadIndustrial(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.deleteUnidadIndustrial(id);
  }

  @Get('unidades-industriales/:id/expediente-completo')
  async getExpedienteCompleto(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.getExpedienteCompleto(id);
  }

  @Post('unidades-industriales/:id/rubros')
  @Roles(Role.ADMINISTRADOR)
  async addRubroActividad(
    @Param('id', ParseIntPipe) unidadIndustrialId: number,
    @Body() dto: any,
  ) {
    return this.expedienteService.addRubroActividad(unidadIndustrialId, dto);
  }

  @Delete('rubros/:id')
  @Roles(Role.ADMINISTRADOR)
  async removeRubroActividad(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.removeRubroActividad(id);
  }

  @Patch('rubros/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateRubroActividad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { codigoCaeb?: string; descripcion?: string; categoria?: number },
  ) {
    return this.expedienteService.updateRubroActividad(id, dto);
  }

  @Get('unidades-industriales/:id/rai')
  async getRAI(@Param('id', ParseIntPipe) unidadIndustrialId: number) {
    return this.expedienteService.getRAI(unidadIndustrialId);
  }

  @Post('unidades-industriales/:id/rai')
  @Roles(Role.ADMINISTRADOR)
  async createRAI(@Param('id', ParseIntPipe) unidadIndustrialId: number) {
    return this.expedienteService.createRAI(unidadIndustrialId);
  }

  @Post('unidades-industriales/:id/rai/registro-inicial')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async createRAIRegistroInicial(
    @Param('id', ParseIntPipe) unidadIndustrialId: number,
    @Body() dto: CreateRAIRegistroInicialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.expedienteService.createRAIRegistroInicial(
      unidadIndustrialId,
      dto,
      file,
    );
  }

  @Post('rai/:raiId/historial')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async addRAIHistorial(
    @Param('raiId', ParseIntPipe) raiId: number,
    @Body() dto: CreateRAIHistorialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.expedienteService.addRAIHistorial(raiId, dto, file);
  }

  @Post('rai/documento/:tipo/:id')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async uploadRAIArchivo(
    @Param('tipo') tipo: 'inicial' | 'historial',
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.expedienteService.uploadRAIArchivo(tipo, id, file);
  }

  @Get('unidades-industriales/:id/irap-categoria3')
  async getIRAPCategoria3(@Param('id', ParseIntPipe) unidadIndustrialId: number) {
    return this.expedienteService.getIRAPCategoria3(unidadIndustrialId);
  }

  @Post('unidades-industriales/:id/irap-categoria3')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async createIRAPCategoria3(
    @Param('id', ParseIntPipe) unidadIndustrialId: number,
    @Body() dto: CreateIRAPCategoria3Dto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.expedienteService.createIRAPCategoria3(unidadIndustrialId, dto, file);
  }

  @Post('irap-categoria3/:id/documento')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async uploadIRAP3Documento(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.expedienteService.uploadIRAP3Documento(id, file);
  }

  @Patch('irap-categoria3/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateIRAPCategoria3(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.expedienteService.updateIRAPCategoria3(id, dto);
  }

  @Delete('irap-categoria3/:id')
  @Roles(Role.ADMINISTRADOR)
  async deleteIRAPCategoria3(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.deleteIRAPCategoria3(id);
  }

  @Get('unidades-industriales/:id/irap-categoria12')
  async getIRAPCategoria12(@Param('id', ParseIntPipe) unidadIndustrialId: number) {
    return this.expedienteService.getIRAPCategoria12(unidadIndustrialId);
  }

  @Post('unidades-industriales/:id/irap-categoria12')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async createIRAPCategoria12(
    @Param('id', ParseIntPipe) unidadIndustrialId: number,
    @Body() dto: CreateIRAPCategoria12Dto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.expedienteService.createIRAPCategoria12(unidadIndustrialId, dto, file);
  }

  @Post('irap-categoria12/:id/documento')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async uploadIRAP12Documento(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.expedienteService.uploadIRAP12Documento(id, file);
  }

  @Patch('irap-categoria12/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateIRAPCategoria12(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.expedienteService.updateIRAPCategoria12(id, dto);
  }

  @Delete('irap-categoria12/:id')
  @Roles(Role.ADMINISTRADOR)
  async deleteIRAPCategoria12(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.deleteIRAPCategoria12(id);
  }

  @Get('unidades-industriales/:id/informes-ambientales')
  async getInformesAmbientales(@Param('id', ParseIntPipe) unidadIndustrialId: number) {
    return this.expedienteService.getInformesAmbientales(unidadIndustrialId);
  }

  @Post('unidades-industriales/:id/informes-ambientales')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async createInformeAmbientalAnual(
    @Param('id', ParseIntPipe) unidadIndustrialId: number,
    @Body() dto: CreateInformeAmbientalAnualDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.expedienteService.createInformeAmbientalAnual(unidadIndustrialId, dto, file);
  }

  @Post('informes-ambientales/:id/documento')
  @Roles(Role.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('documento'))
  async uploadIAADocumento(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.expedienteService.uploadIAADocumento(id, file);
  }

  @Patch('informes-ambientales/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateInformeAmbientalAnual(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.expedienteService.updateInformeAmbientalAnual(id, dto);
  }

  @Delete('informes-ambientales/:id')
  @Roles(Role.ADMINISTRADOR)
  async deleteInformeAmbientalAnual(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.deleteInformeAmbientalAnual(id);
  }

  @Patch('rai/historial/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateHistorialRAI(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.expedienteService.updateHistorialRAI(id, dto);
  }

  @Delete('rai/historial/:id')
  @Roles(Role.ADMINISTRADOR)
  async deleteHistorialRAI(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.deleteHistorialRAI(id);
  }

  @Patch('rai/registro-inicial/:id')
  @Roles(Role.ADMINISTRADOR)
  async updateRAIRegistroInicial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.expedienteService.updateRAIRegistroInicial(id, dto);
  }
}
