import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_CLAVE = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_CLAVE, roles);
