import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // 1. Crear Unidad Industrial
  const unidadIndustrial = await prisma.unidadIndustrial.create({
    data: {
      codigoRai: '0201043289',
      nombre: 'PLANTA INDUSTRIAL READY MIX EL ALTO',
      razonSocial: 'SOCIEDAD BOLIVIANA DE CEMENTO S.A. - SOBOCE S.A.',
      direccion: 'Zona Pucarani Industrial, Av. Hilbo y Calle 31 de Octubre, Lote 2',
      distrito: 2,
      email: 'omontero@soboce.com',
      x: 586875,
      y: 8168841,
      faseActividad: 'OPERACION',
      estadoRegistro: 'VIGENTE',
      categoriaFinal: 3,
      representanteLegal: {
        create: {
          nombre: 'ALVARO ROLANDO ANDRADE CLAVIJO',
          ci: '3502165',
          telefono: '2406040',
        },
      },
      rubrosActividad: {
        create: {
          codigoCaeb: '26950',
          descripcion: 'Fabricación de artículos de hormigón, cemento y yeso',
          categoria: 3,
        },
      },
    },
    include: {
      representanteLegal: true,
      rubrosActividad: true,
    },
  });

  console.log('Unidad Industrial creada:', unidadIndustrial.id);

  // 2. Crear RAI
  const rai = await prisma.rAI.create({
    data: {
      unidadIndustrialId: unidadIndustrial.id,
      registroInicial: {
        create: {
          fechaRegistro: new Date('2016-08-12'),
          tecnicoDesignado: 'René Quispe Casas',
          existeEnArchivo: true,
        },
      },
      historial: {
        create: [
          {
            estado: 'ACTUALIZACION',
            causaRazon: 'Inicio de operaciones',
            fechaRegistro: new Date('2018-01-04'),
            tecnicoDesignado: 'René Quispe Casas',
            existeEnArchivo: true,
          },
          {
            estado: 'MODIFICACION',
            causaRazon: 'Ampliación de la capacidad instalada',
            fechaRegistro: new Date('2018-10-04'),
            tecnicoDesignado: 'René Quispe Casas',
            existeEnArchivo: true,
          },
          {
            estado: 'ACTUALIZACION',
            causaRazon: 'Cambio de razón social',
            fechaRegistro: new Date('2019-02-02'),
            tecnicoDesignado: 'René Quispe Casas',
            existeEnArchivo: true,
          },
          {
            estado: 'RENOVACION',
            causaRazon: 'En operación',
            fechaRegistro: new Date('2019-10-15'),
            tecnicoDesignado: 'José Javier Vela Sulca',
            existeEnArchivo: true,
          },
          {
            estado: 'RENOVACION',
            causaRazon: 'Renovación',
            fechaRegistro: new Date('2023-11-23'),
            tecnicoDesignado: 'Félix Otoya Quispe',
            existeEnArchivo: true,
          },
          {
            estado: 'ACTUALIZACION',
            causaRazon: 'Cambio de representante legal',
            fechaRegistro: new Date('2024-10-15'),
            tecnicoDesignado: 'Rolando Mendoza Quispe',
            existeEnArchivo: true,
          },
        ],
      },
    },
    include: {
      registroInicial: true,
      historial: true,
    },
  });

  console.log('RAI creado:', rai.id);

  // 3. Crear IRAP Categoria 3
  const irapCat3 = await prisma.iRAPCategoria3.createMany({
    data: [
      {
        unidadIndustrialId: unidadIndustrial.id,
        documentoAmbiental: 'LASP',
        fechaInforme: new Date('2025-05-16'),
        estado: 'RECHAZADO',
        tecnicoDesignado: 'Edgar Marcelo Morales R.',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        documentoAmbiental: 'PMA',
        fechaInforme: new Date('2024-07-03'),
        estado: 'APROBADO',
        certificadoAprobacion: '120-003/157',
        tecnicoDesignado: 'Lourdes Elvira Quispe Pa.',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        documentoAmbiental: 'LASP',
        fechaInforme: new Date('2025-02-17'),
        estado: 'APROBADO',
        certificadoAprobacion: '120-003/157',
        tecnicoDesignado: 'Edgar Marcelo Morales R.',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        documentoAmbiental: 'LASP',
        fechaInforme: new Date('2024-11-06'),
        estado: 'APROBADO',
        tecnicoDesignado: 'Edgar Marcelo Morales R.',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        documentoAmbiental: 'LASP',
        fechaInforme: new Date('2024-05-06'),
        estado: 'APROBADO',
        tecnicoDesignado: 'Israel Mendoza Paucara',
        existeEnArchivo: true,
      },
    ],
  });

  console.log('IRAP Categoria 3 creados:', irapCat3.count);

  // 4. Crear Informes Ambientales Anuales
  const iaa = await prisma.informeAmbientalAnual.createMany({
    data: [
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2024,
        fechaInforme: new Date('2025-09-18'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'Edgar Marcelo Morales',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2018,
        fechaInforme: new Date('2019-10-09'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'René Quispe Casas',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2019,
        fechaInforme: new Date('2020-12-30'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'José Javier Vela Sulca',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2019,
        fechaInforme: new Date('2020-12-30'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'Félix Toro Criales',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2019,
        fechaInforme: new Date('2020-12-30'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'José Javier Vela Sulca',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2020,
        fechaInforme: new Date('2021-12-21'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'Nelly Apaza Guachalla',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2021,
        fechaInforme: new Date('2022-05-27'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'Nelly Apaza Guachalla',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2022,
        fechaInforme: new Date('2023-12-14'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'Oswaldo Marca Quispe',
        existeEnArchivo: true,
      },
      {
        unidadIndustrialId: unidadIndustrial.id,
        gestion: 2023,
        fechaInforme: new Date('2024-12-30'),
        monitoreos: ['Combustión', 'Ruido', 'Part. Suspendida'],
        tecnicoDesignado: 'Frank Acarapi Mamani',
        existeEnArchivo: true,
      },
    ],
  });

  console.log('Informes Ambientales Anuales creados:', iaa.count);

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
