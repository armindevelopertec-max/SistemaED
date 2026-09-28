import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smia.com' },
    update: {},
    create: {
      email: 'admin@smia.com',
      password: hashedPassword,
      nombre: 'Administrador',
      role: 'ADMINISTRADOR',
      activo: true,
    },
  });

  console.log('Admin user created:', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());