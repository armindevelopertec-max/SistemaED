import { Module } from '@nestjs/common';
import { TramitesController } from './tramites.controller';
import { TramitesService } from './tramites.service';
import { PdfService } from './pdf.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [TramitesController],
  providers: [TramitesService, PdfService],
  exports: [TramitesService],
})
export class TramitesModule {}