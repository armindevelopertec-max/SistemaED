import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MinioService } from '../minio/minio.service';
import { PdfService } from './pdf.service';
import { CreateTramiteDto } from './dto/create-tramite.dto';
import { UpdateTramiteDto } from './dto/update-tramite.dto';
import { EstadoTramite } from '@prisma/client';

@Injectable()
export class TramitesService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private pdfService: PdfService,
  ) {}

  async create(createTramiteDto: CreateTramiteDto, files?: Express.Multer.File[]) {
    const existingByHojaRuta = await this.prisma.tramite.findUnique({
      where: { hojaRuta: createTramiteDto.hojaRuta },
    });
    if (existingByHojaRuta) {
      throw new ConflictException('Ya existe un trámite con esa Hoja de Ruta');
    }

    const existingByCodigoRai = await this.prisma.tramite.findUnique({
      where: { codigoRai: createTramiteDto.codigoRai },
    });
    if (existingByCodigoRai) {
      throw new ConflictException('Ya existe un trámite con ese Código RAI');
    }

    const tramite = await this.prisma.tramite.create({
      data: {
        hojaRuta: createTramiteDto.hojaRuta,
        codigoRai: createTramiteDto.codigoRai,
        nombreTramite: createTramiteDto.nombreTramite,
        nombreSolicitante: createTramiteDto.nombreSolicitante,
        descripcion: createTramiteDto.descripcion,
        fechaVencimiento: new Date(createTramiteDto.fechaVencimiento),
        observaciones: createTramiteDto.observaciones,
      },
    });

    if (files && files.length > 0) {
      for (const file of files) {
        const { fileName } = await this.minioService.uploadFile(file, `tramites/${tramite.id}`);
        await this.prisma.documento.create({
          data: {
            nombre: file.originalname,
            tipo: file.mimetype,
            rutaMinio: fileName,
            tamano: file.size,
            tramiteId: tramite.id,
          },
        });
      }
    }

    return this.findOne(tramite.id);
  }

  async findAll(filters?: { estado?: EstadoTramite; search?: string }) {
    const where: any = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.search) {
      where.OR = [
        { hojaRuta: { contains: filters.search, mode: 'insensitive' } },
        { codigoRai: { contains: filters.search, mode: 'insensitive' } },
        { nombreSolicitante: { contains: filters.search, mode: 'insensitive' } },
        { nombreTramite: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.tramite.findMany({
      where,
      include: {
        documentos: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            tamano: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { id },
      include: {
        documentos: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            rutaMinio: true,
            tamano: true,
            createdAt: true,
          },
        },
      },
    });

    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    return tramite;
  }

  async findByHojaRuta(hojaRuta: string) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { hojaRuta },
      include: {
        documentos: true,
      },
    });

    if (!tramite) {
      throw new NotFoundException(`Trámite con Hoja de Ruta ${hojaRuta} no encontrado`);
    }

    return tramite;
  }

  async findByCodigoRai(codigoRai: string) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { codigoRai },
      include: {
        documentos: true,
      },
    });

    if (!tramite) {
      throw new NotFoundException(`Trámite con Código RAI ${codigoRai} no encontrado`);
    }

    return tramite;
  }

  async update(id: number, updateTramiteDto: UpdateTramiteDto) {
    const tramite = await this.prisma.tramite.findUnique({ where: { id } });

    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    if (updateTramiteDto.hojaRuta && updateTramiteDto.hojaRuta !== tramite.hojaRuta) {
      const existing = await this.prisma.tramite.findUnique({
        where: { hojaRuta: updateTramiteDto.hojaRuta },
      });
      if (existing) {
        throw new ConflictException('Ya existe un trámite con esa Hoja de Ruta');
      }
    }

    if (updateTramiteDto.codigoRai && updateTramiteDto.codigoRai !== tramite.codigoRai) {
      const existing = await this.prisma.tramite.findUnique({
        where: { codigoRai: updateTramiteDto.codigoRai },
      });
      if (existing) {
        throw new ConflictException('Ya existe un trámite con ese Código RAI');
      }
    }

    const data: any = { ...updateTramiteDto };
    if (updateTramiteDto.fechaVencimiento) {
      data.fechaVencimiento = new Date(updateTramiteDto.fechaVencimiento);
    }

    return this.prisma.tramite.update({
      where: { id },
      data,
      include: {
        documentos: true,
      },
    });
  }

  async addDocumento(id: number, file: Express.Multer.File) {
    const tramite = await this.prisma.tramite.findUnique({ where: { id } });

    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    const { fileName } = await this.minioService.uploadFile(file, `tramites/${id}`);

    const documento = await this.prisma.documento.create({
      data: {
        nombre: file.originalname,
        tipo: file.mimetype,
        rutaMinio: fileName,
        tamano: file.size,
        tramiteId: id,
      },
    });

    return documento;
  }

  async removeDocumento(id: number, documentoId: number) {
    const documento = await this.prisma.documento.findFirst({
      where: { id: documentoId, tramiteId: id },
    });

    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }

    await this.minioService.deleteFile(documento.rutaMinio);
    await this.prisma.documento.delete({ where: { id: documentoId } });

    return { message: 'Documento eliminado correctamente' };
  }

  async generatePdf(id: number) {
    const tramite = await this.findOne(id);

    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    const pdfBuffer = await this.pdfService.generateTramitePdf(tramite);

    const pdfFileName = `tramites/${id}/certificado-${tramite.hojaRuta}.pdf`;
    const buffer = Buffer.from(pdfBuffer);

    await this.minioService.minioClient.putObject(
      this.minioService.getBucketName(),
      pdfFileName,
      buffer,
      buffer.length,
      { 'Content-Type': 'application/pdf' },
    );

    const existingPdf = await this.prisma.documento.findFirst({
      where: { tramiteId: id, nombre: { contains: 'certificado-' } },
    });

    if (existingPdf) {
      await this.minioService.deleteFile(existingPdf.rutaMinio);
      await this.prisma.documento.delete({ where: { id: existingPdf.id } });
    }

    const documento = await this.prisma.documento.create({
      data: {
        nombre: `certificado-${tramite.hojaRuta}.pdf`,
        tipo: 'application/pdf',
        rutaMinio: pdfFileName,
        tamano: buffer.length,
        tramiteId: id,
      },
    });

    const url = await this.minioService.getPresignedUrl(pdfFileName);

    return {
      ...documento,
      url,
    };
  }

  async getStats() {
    const [total, vigentes, porVencer, vencidos, pendientes] = await Promise.all([
      this.prisma.tramite.count(),
      this.prisma.tramite.count({ where: { estado: 'VIGENTE' } }),
      this.prisma.tramite.count({ where: { estado: 'POR_VENCER' } }),
      this.prisma.tramite.count({ where: { estado: 'VENCIDO' } }),
      this.prisma.tramite.count({ where: { estado: 'PENDIENTE' } }),
    ]);

    return { total, vigentes, porVencer, vencidos, pendientes };
  }

  async remove(id: number) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { id },
      include: { documentos: true },
    });

    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    for (const doc of tramite.documentos) {
      await this.minioService.deleteFile(doc.rutaMinio);
    }

    await this.prisma.tramite.delete({ where: { id } });

    return { message: 'Trámite eliminado correctamente' };
  }
}