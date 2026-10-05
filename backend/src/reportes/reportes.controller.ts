import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { AuthGuardJwt } from '../auth/guards/jwt-auth.guard';
import { GuardRoles } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('reportes')
@Controller('reportes')
@UseGuards(AuthGuardJwt, GuardRoles)
@ApiBearerAuth()
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('unidades-industriales')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener reporte de unidades industriales' })
  obtenerReporteUnidades() {
    return this.reportesService.obtenerReporteUnidadesIndustriales();
  }

  @Get('rai')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener estadísticas del RAI' })
  obtenerEstadisticasRAI() {
    return this.reportesService.obtenerEstadisticasRAI();
  }

  @Get('irap')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener estadísticas de IRAPs' })
  obtenerEstadisticasIRAP() {
    return this.reportesService.obtenerEstadisticasIRAP();
  }

  @Get('iaa')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener estadísticas de Informes Ambientales' })
  obtenerEstadisticasIAA() {
    return this.reportesService.obtenerEstadisticasIAA();
  }

  @Get('expediente/:unidadIndustrialId')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener resumen de expediente de unidad industrial' })
  obtenerResumenExpediente(@Param('unidadIndustrialId', ParseIntPipe) unidadIndustrialId: number) {
    return this.reportesService.obtenerResumenExpediente(unidadIndustrialId);
  }
}
