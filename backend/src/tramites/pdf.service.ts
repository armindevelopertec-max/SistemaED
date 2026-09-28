import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateTramitePdf(tramite: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('CERTIFICADO DE TRÁMITE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`);
      doc.moveDown(2);

      doc.fontSize(14).text('Datos del Trámite', { underline: true });
      doc.moveDown(0.5);

      const fields = [
        ['Hoja de Ruta', tramite.hojaRuta],
        ['Código RAI', tramite.codigoRai],
        ['Nombre del Trámite', tramite.nombreTramite],
        ['Nombre del Solicitante', tramite.nombreSolicitante],
        ['Fecha de Creación', new Date(tramite.fechaCreacion).toLocaleDateString('es-ES')],
        ['Fecha de Vencimiento', new Date(tramite.fechaVencimiento).toLocaleDateString('es-ES')],
        ['Estado', tramite.estado],
      ];

      if (tramite.descripcion) {
        fields.push(['Descripción', tramite.descripcion]);
      }

      if (tramite.observaciones) {
        fields.push(['Observaciones', tramite.observaciones]);
      }

      fields.forEach(([label, value]) => {
        doc.fontSize(11).text(`${label}: `, { continued: true });
        doc.font('Helvetica-Bold').text(value || '-');
        doc.font('Helvetica');
        doc.moveDown(0.3);
      });

      if (tramite.documentos && tramite.documentos.length > 0) {
        doc.moveDown();
        doc.fontSize(14).text('Documentos Adjuntos', { underline: true });
        doc.moveDown(0.5);

        tramite.documentos.forEach((docItem: any, index: number) => {
          doc.fontSize(10).text(`${index + 1}. ${docItem.nombre} (${this.formatFileSize(docItem.tamano)})`);
        });
      }

      doc.moveDown(2);
      doc.fontSize(10).text('Este documento fue generado automáticamente por el Sistema SMIA.', {
        align: 'center',
      });

      doc.end();
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}