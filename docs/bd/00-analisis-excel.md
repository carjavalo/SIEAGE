# Análisis de `PRINCIPAL-2026.xlsx` → modelo relacional

Institución: **I.E. Alfonso López Pumarejo** (Cali) · NIT 800.025.227-5 · DANE 176001040101 · Res. 1697 de 2002.

## Qué hay en el libro

| Hoja | Contenido | Rol en la BD |
|---|---|---|
| `10-1` … `11-5` (11 hojas) | 1 fila = 1 estudiante. 364 filas, 69 columnas | Fuente de `estudiantes`, `acudientes`, `matriculas` |
| `PEGAR AQUÍ` | Fila de staging con el mismo layout | Solo herramienta de impresión |
| `CONSTANCIA DE MATRICULA` | Plantilla que imprime la constancia | Reporte / vista |
| `CONSOLIDADO` | Cupos, antiguos, nuevos y disponibles por grupo | Vista agregada |
| `TOTAL MODALIDADES` | Matriculados por modalidad (hoy con `#REF!`) | Vista agregada |
| `DIRECTORES DE GRUPO` | Director por grupo y año lectivo (2017–2022) | `docentes` + `grupos.director_id` |
| `NO TOCAR` | Listas de validación (meses, tipo doc, parentesco, género, grado) | Catálogos |

## Layout de una fila de estudiante

| Columnas | Campo |
|---|---|
| A | `1` = matriculado activo · `R` = retirado (315 activos / 33 R / 16 en blanco) |
| B | Consecutivo de **antiguos** (vacío ⇒ estudiante nuevo) |
| C–E | Fecha de matrícula (día / mes en texto / año) |
| F | Apellidos y nombres, **en un solo campo** |
| G | Sede actual (Principal 289 / Los Farallones 75) |
| H | Modalidad técnica: Asist. Admin. 171, Electrónica 70, Electricidad 60, Ebanistería 56 |
| **I–AF** | **12 pares `GRUPO 2015` … `GRUPO 2026`**: grupo (`5-2`, `10-3`, `No`) + código de sede |
| AG–AL | Jornada, género, fecha de nacimiento (d/m/a), edad (fórmula) |
| AM–AN | Tipo de documento (T.I. 352, P.P.T. 10, C.E. 1, C.C. 1) y número |
| AO–AX | Entrega de boletín 1º…10º (`S` / `NO APLICA`) |
| AY | Fotos `S`/`N` |
| AZ–BF | Acudiente: nombre, cédula, parentesco, dirección, barrio, fijo, celular |
| BG | Observaciones (hasta 398 caracteres) |

## Códigos de sede (decodificados desde la fórmula de la constancia)

| Código | Sede |
|---|---|
| `P` | Principal |
| `LF` | Los Farallones |
| `CP` | Central Provivienda |
| `RP` | Rafael Pombo |
| `PT` | Purificación Trujillo |

Esas 12 columnas dobles son **la historia académica**: un estudiante que dice
`1-3/RP · 5-3/RP · 6-6/LF · 9-2/LF · 10-1/P` pasó por primaria en Rafael Pombo,
bachillerato en Los Farallones y la media en la Principal. En la BD eso se
convierte en **una fila por año** en `matriculas` — no en 24 columnas.

## Hallazgos de calidad de datos (revisar antes de importar)

1. **Documento duplicado**: `1086137008` aparece en dos estudiantes.
2. El nombre viene en un solo campo → no se puede partir en apellidos/nombres de forma fiable.
3. Parentescos con variantes: `Prima` / `prima` / `Hermana` / `Hermana(o)` / `Cuñada` → normalizar al catálogo.
4. Teléfonos mezclan número y texto (`385 2436`, `318 718 4003`) → guardar como `VARCHAR`.
5. 112 barrios distintos escritos a mano, con y sin espacios finales.
6. `GRUPO 2026` a veces trae `9°` / `10°` sin número de grupo → por eso `matriculas.grado_id` es obligatorio y `grupo_id` es opcional.
7. 16 filas sin marca en la columna A (ni activo ni retirado).
8. **Acudientes repetidos** (mínimo 10 cédulas en 2 estudiantes) → son hermanos: confirma que `acudientes` debe ser tabla aparte.
