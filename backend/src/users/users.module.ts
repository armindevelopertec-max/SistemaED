import { Module } from '@nestjs/common';
import { UsuariosController } from './users.controller';
import { UsuariosService } from './users.service';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
