import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO_CLAVE = 'esPublico';
export const Publico = () => SetMetadata(ES_PUBLICO_CLAVE, true);
