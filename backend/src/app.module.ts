import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TramitesModule } from './tramites/tramites.module';
import { MinioModule } from './minio/minio.module';
import { ReportesModule } from './reportes/reportes.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    TramitesModule,
    MinioModule,
    ReportesModule,
  ],
})
export class AppModule {}