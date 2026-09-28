import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('reportes')
@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('estados')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener reporte de estados de trámites' })
  getReporteEstados() {
    return this.reportesService.getReporteEstados();
  }

  @Get('por-vencer')
  @ApiOperation({ summary: 'Obtener trámites próximos a vencer' })
  @ApiQuery({ name: 'dias', required: false, type: Number, description: 'Días de anticipación' })
  getTramitesPorVencer(@Query('dias') dias?: number) {
    return this.reportesService.getTramitesPorVencer(dias || 7);
  }
}