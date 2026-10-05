import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ExpedienteController } from '../controllers/expediente.controller';
import { ExpedienteService } from '../services/expediente.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
    MinioModule,
  ],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
  exports: [ExpedienteService],
})
export class ExpedienteModule {}
