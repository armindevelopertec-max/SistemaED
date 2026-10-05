import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateUnidadIndustrialDto } from '../dto/expediente/create-unidad-industrial.dto';
import { UpdateUnidadIndustrialDto } from '../dto/expediente/update-unidad-industrial.dto';
import { CreateRAIRegistroInicialDto, CreateRAIHistorialDto } from '../dto/expediente/rai.dto';
import { CreateIRAPCategoria3Dto, CreateIRAPCategoria12Dto } from '../dto/expediente/irap.dto';
import { CreateInformeAmbientalAnualDto } from '../dto/expediente/informe-ambiental.dto';

@Injectable()
export class ExpedienteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  private async uploadDocumento(file: Express.Multer.File, prefix: string): Promise<string> {
    const { fileName } = await this.minioService.subirArchivo(file, prefix);
    return fileName;
  }

  async createUnidadIndustrial(
    dto: CreateUnidadIndustrialDto,
    representanteLegalDto?: CreateUnidadIndustrialDto['representanteLegal'],
    rubrosDto?: CreateUnidadIndustrialDto['rubrosActividad'],
  ) {
    return this.prisma.unidadIndustrial.create({
      data: {
        codigoRai: dto.codigoRai,
        nombre: dto.nombre,
        razonSocial: dto.razonSocial,
        direccion: dto.direccion,
        distrito: dto.distrito,
        email: dto.email,
        x: dto.x,
        y: dto.y,
        msnm: dto.msnm,
        faseActividad: dto.faseActividad,
        estadoRegistro: dto.estadoRegistro,
        categoriaFinal: dto.categoriaFinal,
        representanteLegal: representanteLegalDto
          ? {
              create: {
                nombre: representanteLegalDto.nombre,
                ci: representanteLegalDto.ci,
                telefono: representanteLegalDto.telefono,
              },
            }
          : undefined,
        rubrosActividad: rubrosDto
          ? {
              create: rubrosDto.map((r) => ({
                codigoCaeb: r.codigoCaeb,
                descripcion: r.descripcion,
                categoria: r.categoria,
              })),
            }
          : undefined,
      },
      include: {
        representanteLegal: true,
        rubrosActividad: true,
      },
    });
  }

  async getUnidadIndustrial(id: number) {
    const unidad = await this.prisma.unidadIndustrial.findUnique({
      where: { id },
      include: {
        representanteLegal: true,
        rubrosActividad: true,
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
      throw new NotFoundException(`UnidadIndustrial with id ${id} not found`);
    }

    return unidad;
  }

  async getAllUnidadesIndustriales(buscar?: string) {
    const where = buscar
      ? {
          OR: [
            { codigoRai: { contains: buscar, mode: 'insensitive' as const } },
            { nombre: { contains: buscar, mode: 'insensitive' as const } },
            { razonSocial: { contains: buscar, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.unidadIndustrial.findMany({
      where,
      include: {
        representanteLegal: true,
        rubrosActividad: true,
      },
    });
  }

  async updateUnidadIndustrial(id: number, dto: UpdateUnidadIndustrialDto) {
    await this.getUnidadIndustrial(id);

    const { representanteLegal, rubrosActividad, ...unidadData } = dto;

    if (rubrosActividad) {
      await this.prisma.rubroActividad.deleteMany({ where: { unidadIndustrialId: id } });
    }

    return this.prisma.unidadIndustrial.update({
      where: { id },
      data: {
        ...unidadData,
        representanteLegal: representanteLegal
          ? {
              update: {
                nombre: representanteLegal.nombre,
                ci: representanteLegal.ci,
                telefono: representanteLegal.telefono,
              },
            }
          : undefined,
        rubrosActividad: rubrosActividad
          ? {
              create: rubrosActividad.map((r) => ({
                codigoCaeb: r.codigoCaeb || '',
                descripcion: r.descripcion || '',
                categoria: r.categoria || 0,
              })),
            }
          : undefined,
      },
      include: {
        representanteLegal: true,
        rubrosActividad: true,
      },
    });
  }

  async addRubroActividad(unidadIndustrialId: number, dto: { codigoCaeb: string; descripcion: string; categoria: number }) {
    await this.getUnidadIndustrial(unidadIndustrialId);

    return this.prisma.rubroActividad.create({
      data: {
        unidadIndustrialId,
        codigoCaeb: dto.codigoCaeb,
        descripcion: dto.descripcion,
        categoria: dto.categoria,
      },
    });
  }

  async removeRubroActividad(id: number) {
    const rubro = await this.prisma.rubroActividad.findUnique({ where: { id } });
    if (!rubro) {
      throw new NotFoundException(`RubroActividad with id ${id} not found`);
    }

    return this.prisma.rubroActividad.delete({ where: { id } });
  }

  async updateRubroActividad(id: number, dto: { codigoCaeb?: string; descripcion?: string; categoria?: number }) {
    const rubro = await this.prisma.rubroActividad.findUnique({ where: { id } });
    if (!rubro) {
      throw new NotFoundException(`RubroActividad with id ${id} not found`);
    }

    return this.prisma.rubroActividad.update({
      where: { id },
      data: dto,
    });
  }

  async getRAI(unidadIndustrialId: number) {
    await this.getUnidadIndustrial(unidadIndustrialId);

    const rai = await this.prisma.rAI.findUnique({
      where: { unidadIndustrialId },
      include: {
        registroInicial: true,
        historial: true,
      },
    });

    return rai;
  }

  async createRAI(unidadIndustrialId: number) {
    await this.getUnidadIndustrial(unidadIndustrialId);

    const existente = await this.prisma.rAI.findUnique({
      where: { unidadIndustrialId },
    });

    if (existente) {
      return existente;
    }

    return this.prisma.rAI.create({
      data: { unidadIndustrialId },
    });
  }

  async createRAIRegistroInicial(unidadIndustrialId: number, dto: CreateRAIRegistroInicialDto, documentoFile?: Express.Multer.File) {
    const rai = await this.prisma.rAI.findUnique({
      where: { unidadIndustrialId },
    });

    if (!rai) {
      throw new NotFoundException(`RAI not found for unidad ${unidadIndustrialId}`);
    }

    const existente = await this.prisma.rAIRegistroInicial.findUnique({
      where: { raiId: rai.id },
    });

    if (existente) {
      throw new NotFoundException(`Registro inicial ya existe para RAI ${rai.id}`);
    }

    let documentoKey: string | undefined;
    if (documentoFile) {
      documentoKey = await this.uploadDocumento(documentoFile, `rai/${rai.id}/inicial`);
    }

    return this.prisma.rAIRegistroInicial.create({
      data: {
        raiId: rai.id,
        fechaRegistro: new Date(dto.fechaRegistro),
        tecnicoDesignado: dto.tecnicoDesignado,
        existeEnArchivo: dto.existeEnArchivo ?? true,
        documentoKey,
      },
    });
  }

  async addRAIHistorial(raiId: number, dto: CreateRAIHistorialDto, documentoFile?: Express.Multer.File) {
    const rai = await this.prisma.rAI.findUnique({ where: { id: raiId } });
    if (!rai) {
      throw new NotFoundException(`RAI with id ${raiId} not found`);
    }

    let documentoKey: string | undefined;
    if (documentoFile) {
      documentoKey = await this.uploadDocumento(documentoFile, `rai/${raiId}/historial`);
    }

    return this.prisma.rAIHistorial.create({
      data: {
        raiId,
        estado: dto.estado,
        causaRazon: dto.causaRazon,
        fechaRegistro: new Date(dto.fechaRegistro),
        tecnicoDesignado: dto.tecnicoDesignado,
        existeEnArchivo: dto.existeEnArchivo ?? true,
        documentoKey,
      },
    });
  }

  async uploadRAIArchivo(tipo: 'inicial' | 'historial', id: number, file: Express.Multer.File) {
    if (tipo === 'inicial') {
      const registro = await this.prisma.rAIRegistroInicial.findUnique({ where: { id } });
      if (!registro) {
        throw new NotFoundException(`RAIRegistroInicial with id ${id} not found`);
      }
      const documentoKey = await this.uploadDocumento(file, `rai/${registro.raiId}/inicial`);
      return this.prisma.rAIRegistroInicial.update({
        where: { id },
        data: { documentoKey },
      });
    } else {
      const historial = await this.prisma.rAIHistorial.findUnique({ where: { id } });
      if (!historial) {
        throw new NotFoundException(`RAIHistorial with id ${id} not found`);
      }
      const documentoKey = await this.uploadDocumento(file, `rai/${historial.raiId}/historial`);
      return this.prisma.rAIHistorial.update({
        where: { id },
        data: { documentoKey },
      });
    }
  }

  async getIRAPCategoria3(unidadIndustrialId: number) {
    await this.getUnidadIndustrial(unidadIndustrialId);
    return this.prisma.iRAPCategoria3.findMany({
      where: { unidadIndustrialId },
    });
  }

  async createIRAPCategoria3(unidadIndustrialId: number, dto: CreateIRAPCategoria3Dto, documentoFile?: Express.Multer.File) {
    await this.getUnidadIndustrial(unidadIndustrialId);

    let documentoKey: string | undefined;
    if (documentoFile) {
      documentoKey = await this.uploadDocumento(documentoFile, `irap/categoria3/${unidadIndustrialId}`);
    }

    return this.prisma.iRAPCategoria3.create({
      data: {
        unidadIndustrialId,
        documentoAmbiental: dto.documentoAmbiental,
        fechaInforme: new Date(dto.fechaInforme),
        estado: dto.estado,
        certificadoAprobacion: dto.certificadoAprobacion,
        tecnicoDesignado: dto.tecnicoDesignado,
        existeEnArchivo: dto.existeEnArchivo ?? true,
        documentoKey,
      },
    });
  }

  async uploadIRAP3Documento(id: number, file: Express.Multer.File) {
    const irap = await this.prisma.iRAPCategoria3.findUnique({ where: { id } });
    if (!irap) {
      throw new NotFoundException(`IRAPCategoria3 with id ${id} not found`);
    }

    const documentoKey = await this.uploadDocumento(file, `irap/categoria3/${irap.unidadIndustrialId}`);
    return this.prisma.iRAPCategoria3.update({
      where: { id },
      data: { documentoKey },
    });
  }

  async getIRAPCategoria12(unidadIndustrialId: number) {
    await this.getUnidadIndustrial(unidadIndustrialId);
    return this.prisma.iRAPCategoria12.findMany({
      where: { unidadIndustrialId },
    });
  }

  async createIRAPCategoria12(unidadIndustrialId: number, dto: CreateIRAPCategoria12Dto, documentoFile?: Express.Multer.File) {
    await this.getUnidadIndustrial(unidadIndustrialId);

    let documentoKey: string | undefined;
    if (documentoFile) {
      documentoKey = await this.uploadDocumento(documentoFile, `irap/categoria12/${unidadIndustrialId}`);
    }

    return this.prisma.iRAPCategoria12.create({
      data: {
        unidadIndustrialId,
        documentoAmbiental: dto.documentoAmbiental,
        fechaInforme: new Date(dto.fechaInforme),
        estado: dto.estado,
        certificadAprobacion: dto.certificadAprobacion,
        remisionDocumento: dto.remisionDocumento,
        daa: dto.daa,
        fechaDaa: dto.fechaDaa ? new Date(dto.fechaDaa) : null,
        tecnicoDesignado: dto.tecnicoDesignado,
        existeEnArchivo: dto.existeEnArchivo ?? true,
        documentoKey,
      },
    });
  }

  async uploadIRAP12Documento(id: number, file: Express.Multer.File) {
    const irap = await this.prisma.iRAPCategoria12.findUnique({ where: { id } });
    if (!irap) {
      throw new NotFoundException(`IRAPCategoria12 with id ${id} not found`);
    }

    const documentoKey = await this.uploadDocumento(file, `irap/categoria12/${irap.unidadIndustrialId}`);
    return this.prisma.iRAPCategoria12.update({
      where: { id },
      data: { documentoKey },
    });
  }

  async getInformesAmbientales(unidadIndustrialId: number) {
    await this.getUnidadIndustrial(unidadIndustrialId);
    return this.prisma.informeAmbientalAnual.findMany({
      where: { unidadIndustrialId },
    });
  }

  async createInformeAmbientalAnual(unidadIndustrialId: number, dto: CreateInformeAmbientalAnualDto, documentoFile?: Express.Multer.File) {
    await this.getUnidadIndustrial(unidadIndustrialId);

    let documentoKey: string | undefined;
    if (documentoFile) {
      documentoKey = await this.uploadDocumento(documentoFile, `informes-ambientales/${unidadIndustrialId}`);
    }

    return this.prisma.informeAmbientalAnual.create({
      data: {
        unidadIndustrialId,
        gestion: dto.gestion,
        fechaInforme: new Date(dto.fechaInforme),
        monitoreos: dto.monitoreos,
        tecnicoDesignado: dto.tecnicoDesignado,
        existeEnArchivo: dto.existeEnArchivo ?? true,
        documentoKey,
      },
    });
  }

  async uploadIAADocumento(id: number, file: Express.Multer.File) {
    const informe = await this.prisma.informeAmbientalAnual.findUnique({ where: { id } });
    if (!informe) {
      throw new NotFoundException(`InformeAmbientalAnual with id ${id} not found`);
    }

    const documentoKey = await this.uploadDocumento(file, `informes-ambientales/${informe.unidadIndustrialId}`);
    return this.prisma.informeAmbientalAnual.update({
      where: { id },
      data: { documentoKey },
    });
  }

  async updateInformeAmbientalAnual(id: number, dto: any) {
    const informe = await this.prisma.informeAmbientalAnual.findUnique({ where: { id } });
    if (!informe) {
      throw new NotFoundException(`InformeAmbientalAnual with id ${id} not found`);
    }

    return this.prisma.informeAmbientalAnual.update({
      where: { id },
      data: {
        ...dto,
        fechaInforme: dto.fechaInforme ? new Date(dto.fechaInforme) : undefined,
      },
    });
  }

  async deleteInformeAmbientalAnual(id: number) {
    const informe = await this.prisma.informeAmbientalAnual.findUnique({ where: { id } });
    if (!informe) {
      throw new NotFoundException(`InformeAmbientalAnual with id ${id} not found`);
    }
    return this.prisma.informeAmbientalAnual.delete({ where: { id } });
  }

  async updateIRAPCategoria3(id: number, dto: any) {
    const irap = await this.prisma.iRAPCategoria3.findUnique({ where: { id } });
    if (!irap) {
      throw new NotFoundException(`IRAPCategoria3 with id ${id} not found`);
    }

    return this.prisma.iRAPCategoria3.update({
      where: { id },
      data: {
        ...dto,
        fechaInforme: dto.fechaInforme ? new Date(dto.fechaInforme) : undefined,
      },
    });
  }

  async deleteIRAPCategoria3(id: number) {
    const irap = await this.prisma.iRAPCategoria3.findUnique({ where: { id } });
    if (!irap) {
      throw new NotFoundException(`IRAPCategoria3 with id ${id} not found`);
    }
    return this.prisma.iRAPCategoria3.delete({ where: { id } });
  }

  async updateIRAPCategoria12(id: number, dto: any) {
    const irap = await this.prisma.iRAPCategoria12.findUnique({ where: { id } });
    if (!irap) {
      throw new NotFoundException(`IRAPCategoria12 with id ${id} not found`);
    }

    return this.prisma.iRAPCategoria12.update({
      where: { id },
      data: {
        ...dto,
        fechaInforme: dto.fechaInforme ? new Date(dto.fechaInforme) : undefined,
        fechaDaa: dto.fechaDaa ? new Date(dto.fechaDaa) : undefined,
      },
    });
  }

  async deleteIRAPCategoria12(id: number) {
    const irap = await this.prisma.iRAPCategoria12.findUnique({ where: { id } });
    if (!irap) {
      throw new NotFoundException(`IRAPCategoria12 with id ${id} not found`);
    }
    return this.prisma.iRAPCategoria12.delete({ where: { id } });
  }

  async updateHistorialRAI(id: number, dto: any) {
    const historial = await this.prisma.rAIHistorial.findUnique({ where: { id } });
    if (!historial) {
      throw new NotFoundException(`RAIHistorial with id ${id} not found`);
    }

    return this.prisma.rAIHistorial.update({
      where: { id },
      data: {
        ...dto,
        fechaRegistro: dto.fechaRegistro ? new Date(dto.fechaRegistro) : undefined,
      },
    });
  }

  async updateRAIRegistroInicial(id: number, dto: any) {
    const registro = await this.prisma.rAIRegistroInicial.findUnique({ where: { id } });
    if (!registro) {
      throw new NotFoundException(`RAIRegistroInicial with id ${id} not found`);
    }

    return this.prisma.rAIRegistroInicial.update({
      where: { id },
      data: {
        ...dto,
        fechaRegistro: dto.fechaRegistro ? new Date(dto.fechaRegistro) : undefined,
      },
    });
  }

  async deleteHistorialRAI(id: number) {
    const historial = await this.prisma.rAIHistorial.findUnique({ where: { id } });
    if (!historial) {
      throw new NotFoundException(`RAIHistorial with id ${id} not found`);
    }
    return this.prisma.rAIHistorial.delete({ where: { id } });
  }

  async getExpedienteCompleto(unidadIndustrialId: number) {
    return this.getUnidadIndustrial(unidadIndustrialId);
  }

  async deleteUnidadIndustrial(id: number) {
    await this.getUnidadIndustrial(id);
    return this.prisma.unidadIndustrial.delete({ where: { id } });
  }
}
