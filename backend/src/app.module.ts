import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './users/users.module';
import { MinioModule } from './minio/minio.module';
import { ReportesModule } from './reportes/reportes.module';
import { PrismaModule } from './database/prisma.module';
import { ExpedienteModule } from './expediente/expediente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    MinioModule,
    ReportesModule,
    ExpedienteModule,
  ],
})
export class AppModule {}