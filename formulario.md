

```text
UNIDAD INDUSTRIAL
│
├── 1. IDENTIFICACIÓN DE LA UNIDAD INDUSTRIAL
│
├── 2. RUBRO DE LA ACTIVIDAD (CAEB) Y CATEGORÍA
│
├── 3. REGISTRO AMBIENTAL INDUSTRIAL - RAI
│
├── 4. CATEGORÍA 3 - IRAP'S
│
├── 5. CATEGORÍA 1 Y 2 - IRAP'S
│
└── 6. INFORMES AMBIENTALES ANUALES
```

## 1. Identificación de la Unidad Industrial

```text
codigoRAI
unidadIndustrial
razonSocial
direccion
representanteLegal
ciRepresentanteLegal
telefono
telefonoRepresentanteLegal
coordenadaX
coordenadaY
msnm
email
distrito
faseActividad
estadoRegistro
categoriaFinal
```

---

## 2. Rubro de la Actividad (CAEB) y Categoría

Como puede haber más de un rubro:

```text
rubrosActividad[]
```

Cada registro:

```text
codigoCAEB
descripcion
categoria
```

Ejemplo:

```json
{
  "codigoCAEB": "26950",
  "descripcion": "Fabricación de artículos de hormigón, cemento y yeso",
  "categoria": 3
}
```

---

## 3. Registro Ambiental Industrial — RAI

### Registro inicial

```text
fechaRegistroInicial
tecnicoDesignado
existenciaEnArchivo
```

### Historial RAI

```text
raiHistorial[]
```

Cada registro:

```text
estado
causaRazon
fechaRegistro
tecnicoDesignado
existenciaEnArchivo
```

Ejemplo:

```json
{
  "estado": "ACTUALIZACION",
  "causaRazon": "Inicio de operaciones",
  "fechaRegistro": "2018-01-04",
  "tecnicoDesignado": "René Quispe Casas",
  "existenciaEnArchivo": true
}
```

---

## 4. Categoría 3 — IRAP's

```text
irapCategoria3[]
```

Cada registro:

```text
documentoAmbiental
fechaInforme
estado
certificadoAprobacion
tecnicoDesignado
existenciaEnArchivo
```

Ejemplo:

```json
{
  "documentoAmbiental": "LASP",
  "fechaInforme": "2025-05-16",
  "estado": "RECHAZADO",
  "certificadoAprobacion": null,
  "tecnicoDesignado": "Edgar Marcelo Morales R.",
  "existenciaEnArchivo": true
}
```

---

## 5. Categoría 1 y 2 — IRAP's

La imagen muestra estas columnas:

```text
documentoAmbiental
fechaInforme
estado
remisionDocumento
DAA
fechaDAA
tecnicoDesignado
existenciaEnArchivo
```

Por tanto:

```text
irapCategoria1y2[]
```

Cada registro:

```json
{
  "documentoAmbiental": null,
  "fechaInforme": null,
  "estado": null,
  "remisionDocumento": null,
  "daa": null,
  "fechaDAA": null,
  "tecnicoDesignado": null,
  "existenciaEnArchivo": null
}
```

Actualmente está vacío en la imagen.

---

## 6. Informes Ambientales Anuales — IAA

```text
informesAmbientalesAnuales[]
```

Cada registro:

```text
gestionIAA
fechaInforme
monitoreosIAA
tecnicoDesignado
existenciaEnArchivo
```

Y **monitoreosIAA** puede ser una lista:

```json
{
  "gestionIAA": 2024,
  "fechaInforme": "2025-09-18",
  "monitoreosIAA": [
    "Combustión",
    "Ruido",
    "Part. Suspendida"
  ],
  "tecnicoDesignado": "Edgar Marcelo Morales",
  "existenciaEnArchivo": true
}
```

### En resumen, tu modelo web queda:

```text
UnidadIndustrial
│
├── identificacion
│
├── rubrosActividad[]
│
├── rai
│   ├── registroInicial
│   └── historial[]
│
├── irapCategoria3[]
│
├── irapCategoria1y2[]
│
└── informesAmbientalesAnuales[]
```


