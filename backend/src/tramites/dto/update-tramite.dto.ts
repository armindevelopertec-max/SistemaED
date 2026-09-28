import { PartialType } from '@nestjs/swagger';
import { CreateTramiteDto } from './create-tramite.dto';
import { EstadoTramite } from '@prisma/client';

export class UpdateTramiteDto extends PartialType(CreateTramiteDto) {
  estado?: EstadoTramite;
}