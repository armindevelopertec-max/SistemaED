import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async obtenerReporteUnidadesIndustriales() {
    const [total, porCategoria, porEstado, porFase] = await Promise.all([
      this.prisma.unidadIndustrial.count(),
      this.prisma.unidadIndustrial.groupBy({
        by: ['categoriaFinal'],
        _count: true,
      }),
      this.prisma.unidadIndustrial.groupBy({
        by: ['estadoRegistro'],
        _count: true,
      }),
      this.prisma.unidadIndustrial.groupBy({
        by: ['faseActividad'],
        _count: true,
      }),
    ]);

    return {
      total,
      porCategoria: porCategoria.map((c) => ({
        categoria: c.categoriaFinal,
        cantidad: c._count,
      })),
      porEstado: porEstado.map((e) => ({
        estado: e.estadoRegistro,
        cantidad: e._count,
      })),
      porFase: porFase.map((f) => ({
        fase: f.faseActividad,
        cantidad: f._count,
      })),
    };
  }

  async obtenerEstadisticasRAI() {
    const [total, conRAI, sinRAI] = await Promise.all([
      this.prisma.unidadIndustrial.count(),
      this.prisma.rAI.count(),
      this.prisma.unidadIndustrial.count({
        where: { rai: null },
      }),
    ]);

    const historialesCount = await this.prisma.rAIHistorial.count();
    const registrosInicialesCount = await this.prisma.rAIRegistroInicial.count();

    return {
      totalUnidades: total,
      conRAI,
      sinRAI,
      totalRegistrosIniciales: registrosInicialesCount,
      totalHistoriales: historialesCount,
    };
  }

  async obtenerEstadisticasIRAP() {
    const [categoria3, categoria12] = await Promise.all([
      this.prisma.iRAPCategoria3.groupBy({
        by: ['estado'],
        _count: true,
      }),
      this.prisma.iRAPCategoria12.groupBy({
        by: ['estado'],
        _count: true,
      }),
    ]);

    return {
      categoria3: categoria3.map((c) => ({
        estado: c.estado,
        cantidad: c._count,
      })),
      categoria12: categoria12.map((c) => ({
        estado: c.estado,
        cantidad: c._count,
      })),
    };
  }

  async obtenerEstadisticasIAA() {
    const [total, porGestion] = await Promise.all([
      this.prisma.informeAmbientalAnual.count(),
      this.prisma.informeAmbientalAnual.groupBy({
        by: ['gestion'],
        _count: true,
        orderBy: { gestion: 'desc' },
      }),
    ]);

    return {
      total,
      porGestion: porGestion.map((g) => ({
        gestion: g.gestion,
        cantidad: g._count,
      })),
    };
  }

  async obtenerResumenExpediente(unidadIndustrialId: number) {
    const unidad = await this.prisma.unidadIndustrial.findUnique({
      where: { id: unidadIndustrialId },
      include: {
        rai: {
          include: {
            registroInicial: true,
            historial: true,
          },
        },
        irapCategoria3: true,
        irapCategoria12: true,
        informesAmbientales: true,
      },
    });

    if (!unidad) {
      return null;
    }

    return {
      unidadIndustrial: {
        id: unidad.id,
        nombre: unidad.nombre,
        codigoRai: unidad.codigoRai,
        estadoRegistro: unidad.estadoRegistro,
        categoriaFinal: unidad.categoriaFinal,
      },
      rai: {
        existe: !!unidad.rai,
        registroInicial: unidad.rai?.registroInicial || null,
        historial: unidad.rai?.historial.length || 0,
      },
      irapCategoria3: {
        total: unidad.irapCategoria3.length,
        aprobados: unidad.irapCategoria3.filter((i) => i.estado === 'APROBADO').length,
        rechazados: unidad.irapCategoria3.filter((i) => i.estado === 'RECHAZADO').length,
      },
      irapCategoria12: {
        total: unidad.irapCategoria12.length,
        aprobados: unidad.irapCategoria12.filter((i) => i.estado === 'APROBADO').length,
        rechazados: unidad.irapCategoria12.filter((i) => i.estado === 'RECHAZADO').length,
      },
      informesAmbientales: {
        total: unidad.informesAmbientales.length,
        gestiones: unidad.informesAmbientales.map((i) => i.gestion),
      },
    };
  }
}
