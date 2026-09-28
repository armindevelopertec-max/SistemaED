import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async actualizarEstados() {
    const hoy = new Date();
    const enTresDias = new Date();
    enTresDias.setDate(hoy.getDate() + 3);

    await this.prisma.$transaction([
      this.prisma.tramite.updateMany({
        where: {
          estado: { in: ['PENDIENTE', 'VIGENTE', 'POR_VENCER'] },
          fechaVencimiento: { lt: hoy },
        },
        data: { estado: 'VENCIDO' },
      }),
      this.prisma.tramite.updateMany({
        where: {
          estado: { in: ['PENDIENTE', 'VIGENTE'] },
          fechaVencimiento: { gte: hoy, lte: enTresDias },
        },
        data: { estado: 'POR_VENCER' },
      }),
      this.prisma.tramite.updateMany({
        where: {
          estado: 'PENDIENTE',
          fechaVencimiento: { gt: enTresDias },
        },
        data: { estado: 'VIGENTE' },
      }),
    ]);

    console.log('Estados de trámites actualizados automáticamente');
  }

  async getReporteEstados() {
    const [total, vigentes, porVencer, vencidos, pendientes] = await Promise.all([
      this.prisma.tramite.count(),
      this.prisma.tramite.count({ where: { estado: 'VIGENTE' } }),
      this.prisma.tramite.count({ where: { estado: 'POR_VENCER' } }),
      this.prisma.tramite.count({ where: { estado: 'VENCIDO' } }),
      this.prisma.tramite.count({ where: { estado: 'PENDIENTE' } }),
    ]);

    return {
      total,
      porEstado: { vigentes, porVencer, vencidos, pendientes },
      porcentajeVencidos: total > 0 ? ((vencidos / total) * 100).toFixed(2) : '0.00',
    };
  }

  async getTramitesPorVencer(dias: number = 7) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    return this.prisma.tramite.findMany({
      where: {
        estado: { in: ['VIGENTE', 'POR_VENCER'] },
        fechaVencimiento: { lte: fechaLimite },
      },
      orderBy: { fechaVencimiento: 'asc' },
      select: {
        id: true,
        hojaRuta: true,
        codigoRai: true,
        nombreTramite: true,
        nombreSolicitante: true,
        fechaVencimiento: true,
        estado: true,
      },
    });
  }
}