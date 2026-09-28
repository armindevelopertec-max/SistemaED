import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { TramitesModule } from '../tramites/tramites.module';

@Module({
  imports: [TramitesModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}