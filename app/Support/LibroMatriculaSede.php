<?php

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * El libro de matrícula de una sede, con el mismo formato del Excel que el
 * colegio lleva a mano (p. ej. «PRINCIPAL-2026.xlsx»): una hoja por grupo con
 * sus 59 columnas y el bloque de totales, CONSOLIDADO, TOTAL MODALIDADES (si la
 * sede tiene media técnica), DIRECTORES DE GRUPO y NO TOCAR. Las fórmulas son
 * las del libro original y funcionan (en el original, TOTAL MODALIDADES tenía #REF!).
 *
 * Columnas de una hoja de grupo (ver docs/bd/00-analisis-excel.md, que describe
 * la importación en sentido contrario):
 *   A 1 = activo, R = retirado (vacía: cancelado) · B consecutivo de antiguos
 *   C–E fecha de matrícula · F nombre · G sede · H modalidad
 *   I–AF grupo y sede de cada uno de los 12 últimos años («No» si no estaba)
 *   AG jornada · AH género · AI–AK nacimiento · AL edad (fórmula) · AM–AN documento
 *   AO–AX boletín 1.º…10.º · AY fotos · AZ–BF acudiente · BG observaciones
 */
final class LibroMatriculaSede
{
    private const AÑOS_DE_HISTORIA = 12;

    private const FILAS_EN_BLANCO = 5;

    private const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    private const PARENTESCOS = ['Madre', 'Padre', 'Hermana(o)', 'Abuela(o)', 'Tia(o)', 'Madrastra', 'Padrastro', 'Prima(o)'];

    private const VERDE = 'FF00B050';

    private const NARANJA = 'FFFFC000';

    private const AZUL_PESTANA = 'FF00B0F0';

    private const AZUL_MODALIDAD = 'FF4BACC6';

    private const VERDE_CLARO = 'FF92D050';

    // Columnas fijas de la hoja de grupo.
    private const C_PRIMER_ANIO = 9;      // I

    private const C_JORNADA = 33;         // AG

    private const C_BOLETIN = 41;         // AO (1.º) … AX (10.º)

    private const C_ULTIMA = 59;          // BG

    /** @var array<int, array<string, mixed>> Por grupo: filas y dónde quedaron los totales (para CONSOLIDADO). */
    private array $hojas = [];

    private function __construct(private object $anio, private object $sede) {}

    /** @return array{0: Spreadsheet, 1: string}|null el libro y el nombre del archivo; null si el año o la sede no existen */
    public static function generar(int $anio, string $sede): ?array
    {
        $a = DB::table('anios_lectivos')->where('anio', $anio)->first(['id', 'anio']);
        $s = DB::table('sedes')->where('codigo', $sede)->first(['id', 'codigo', 'nombre']);
        if (! $a || ! $s) {
            return null;
        }

        $libro = (new self($a, $s))->armar();

        // Como los archivos del colegio: «PRINCIPAL-2026.xlsx», «PURIFICACION TRUJILLO-2026.xlsx».
        return [$libro, Str::upper(Str::ascii($s->nombre)).'-'.$a->anio.'.xlsx'];
    }

    private function armar(): Spreadsheet
    {
        $grupos = $this->grupos();
        $matriculas = $this->matriculas($grupos->keys());
        $historia = $this->historia($matriculas->pluck('estudiante_id')->unique());
        $boletines = DB::table('boletines_excel')->whereIn('matricula_id', $matriculas->pluck('id'))->get()
            ->groupBy('matricula_id')->map(fn ($b) => $b->pluck('valor', 'numero'));

        $libro = new Spreadsheet;
        $libro->getProperties()->setCreator('SIEAGE')->setTitle("Matrícula {$this->anio->anio} · Sede {$this->sede->nombre}");
        $libro->getDefaultStyle()->getFont()->setName('Calibri')->setSize(11);
        $libro->removeSheetByIndex(0);

        foreach ($grupos as $g) {
            $hoja = new Worksheet($libro, $g->codigo);
            $libro->addSheet($hoja);
            $this->hojaDeGrupo($hoja, $g, $matriculas->where('grupo_id', $g->id)->values(), $historia, $boletines);
        }

        $this->consolidado($libro, $grupos);
        if ($grupos->contains(fn ($g) => $g->grado >= 10)) {
            $this->totalModalidades($libro, $grupos, $matriculas);
        }
        $this->directores($libro, $grupos);
        $this->noTocar($libro, $grupos);

        $libro->setActiveSheetIndex(0);

        return $libro;
    }

    // ------------------------------------------------------------------ datos

    private function grupos(): Collection
    {
        return DB::table('grupos as g')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->leftJoin('docentes as d', 'd.id', '=', 'g.director_id')
            ->where('g.anio_lectivo_id', $this->anio->id)
            ->where('g.sede_id', $this->sede->id)
            ->orderBy('gr.numero')->orderBy('g.numero')
            ->get(['g.id', 'g.codigo', 'g.jornada', 'g.cupos_proyectados as cupos', 'gr.numero as grado', 'd.nombre_completo as director'])
            ->keyBy('id');
    }

    /** Las matrículas del año en los grupos de la sede, en el orden de la lista del Excel. */
    private function matriculas(Collection $gruposIds): Collection
    {
        return DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('estudiante_acudiente as ea', function ($join) {
                $join->on('ea.estudiante_id', '=', 'e.id')->where('ea.es_principal', true);
            })
            ->leftJoin('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->leftJoin('parentescos as p', 'p.id', '=', 'ea.parentesco_id')
            ->leftJoin('barrios as b', 'b.id', '=', 'a.barrio_id')
            ->where('m.anio_lectivo_id', $this->anio->id)
            ->whereIn('m.grupo_id', $gruposIds)
            ->whereNull('e.deleted_at')
            // Sin número de orden (matriculados desde SIEAGE) van al final, por nombre.
            ->orderByRaw('m.numero_orden is null')->orderBy('m.numero_orden')->orderBy('e.nombre_completo')
            ->get([
                'm.id', 'm.estudiante_id', 'm.grupo_id', 'm.estado', 'm.condicion', 'm.fecha_matricula', 'm.observaciones',
                DB::raw('coalesce(m.jornada, g.jornada) as jornada'), 'mo.nombre as modalidad',
                'e.nombre_completo', 'e.genero', 'e.fecha_nacimiento', 'e.tipo_documento', 'e.numero_documento', 'e.tiene_foto',
                'a.nombre_completo as acudiente', 'a.numero_documento as acudiente_documento', 'a.direccion as acudiente_direccion',
                'a.telefono_fijo', 'a.telefono_celular', 'p.nombre as parentesco', 'ea.parentesco_otro', 'b.nombre as barrio',
            ]);
    }

    /** Grupo (o grado, si no tenía grupo) y sede de cada estudiante en cada año. */
    private function historia(Collection $estudiantes): Collection
    {
        return DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('sedes as s', 's.id', '=', 'm.sede_id')
            ->whereIn('m.estudiante_id', $estudiantes)
            ->get(['m.estudiante_id', 'al.anio', 'g.codigo as grupo', 'gr.numero as grado', 's.codigo as sede'])
            ->groupBy('estudiante_id')
            ->map(fn ($filas) => $filas->keyBy('anio'));
    }

    // ------------------------------------------------------------------ hoja de grupo

    private function hojaDeGrupo(Worksheet $h, object $g, Collection $filas, Collection $historia, Collection $boletines): void
    {
        $anio = $this->anio->anio;
        $primerAnio = $anio - self::AÑOS_DE_HISTORIA + 1;
        $h->getTabColor()->setARGB(self::AZUL_PESTANA);
        $h->setShowGridlines(false);
        $h->freezePane('G3');

        // --- encabezado (filas 1 y 2)
        $h->getRowDimension(1)->setRowHeight(19.5);
        $h->getRowDimension(2)->setRowHeight(19.5);
        $titulos = [
            'C1' => 'FECHA MATRÍCULA', 'C2' => 'DÍA', 'D2' => 'MES', 'E2' => 'AÑO', 'F1' => 'APELLIDOS Y NOMBRES', 'G1' => 'SEDE',
            'H1' => 'MODALIDAD TÉCNICA', 'AG1' => 'JORNADA', 'AH1' => 'GENERO', 'AI1' => 'FECHA NACIMIENTO', 'AI2' => 'DÍA', 'AJ2' => 'MES',
            'AK2' => 'AÑO', 'AL1' => 'EDAD', 'AL2' => $anio, 'AM1' => 'TIPO DOC', 'AN1' => 'NUMERO', 'AO1' => 'BOLETIN', 'AY1' => 'FOTOS',
            'AZ1' => 'NOMBRE DEL ACUDIENTE', 'BA1' => 'CÉDULA', 'BB1' => 'PARENTESCO', 'BC1' => 'DIRECCIÓN', 'BD1' => 'BARRIO',
            'BE1' => 'TELÉFONO FIJO', 'BF1' => 'TELÉFONO CELULAR', 'BG1' => 'OBSERVACIONES',
        ];
        foreach ($titulos as $celda => $texto) {
            $h->setCellValue($celda, $texto);
        }
        for ($n = 1; $n <= 10; $n++) {
            $h->setCellValue($this->col(self::C_BOLETIN + $n - 1).'2', "{$n}º");
        }
        $combinar = ['A1:A2', 'B1:B2', 'C1:E1', 'F1:F2', 'G1:G2', 'H1:H2', 'AG1:AG2', 'AH1:AH2', 'AI1:AK1', 'AM1:AM2', 'AN1:AN2',
            'AO1:AX1', 'AY1:AY2', 'AZ1:AZ2', 'BA1:BA2', 'BB1:BB2', 'BC1:BC2', 'BD1:BD2', 'BE1:BE2', 'BF1:BF2'];
        for ($i = 0; $i < self::AÑOS_DE_HISTORIA; $i++) {
            $c = self::C_PRIMER_ANIO + 2 * $i;
            $h->setCellValue($this->col($c).'1', 'GRUPO'.($primerAnio + $i));
            $combinar[] = $this->col($c).'1:'.$this->col($c + 1).'2';
        }
        foreach ($combinar as $rango) {
            $h->mergeCells($rango);
        }
        $h->getStyle('A1:BG2')->applyFromArray($this->estilo(12, true, self::VERDE, Border::BORDER_MEDIUM, true));
        $h->getStyle('A1')->getFill()->setFillType(Fill::FILL_NONE);
        $h->getStyle('I1:AF1')->getNumberFormat()->setFormatCode('@');

        // --- una fila por estudiante
        // Como en el libro del colegio, unas filas en blanco al final para matricular a mano.
        $ultima = 2 + $filas->count() + self::FILAS_EN_BLANCO;
        $previo = $this->col(self::C_PRIMER_ANIO + 2 * (self::AÑOS_DE_HISTORIA - 2));   // grupo del año anterior (AC)
        $consecutivo = 0;
        foreach ($filas as $k => $m) {
            $r = 3 + $k;
            $nacimiento = $m->fecha_nacimiento ? explode('-', $m->fecha_nacimiento) : null;
            $matricula = $m->fecha_matricula ? explode('-', $m->fecha_matricula) : null;
            $valores = [
                'A' => $m->estado === 'activo' ? 1 : ($m->estado === 'retirado' ? 'R' : null),
                'B' => $m->condicion !== 'nuevo' ? ++$consecutivo : null,
                'C' => $matricula ? (int) $matricula[2] : null,
                'D' => $matricula ? self::MESES[(int) $matricula[1] - 1] : null,
                'E' => $matricula ? (int) $matricula[0] : null,
                'F' => $m->nombre_completo,
                'G' => $this->sede->nombre,
                'H' => $m->modalidad,
                'AG' => $m->jornada,
                'AH' => in_array($m->genero, ['F', 'M'], true) ? $m->genero : null,
                'AI' => $nacimiento ? (int) $nacimiento[2] : null,
                'AJ' => $nacimiento ? (int) $nacimiento[1] : null,
                'AK' => $nacimiento ? (int) $nacimiento[0] : null,
                'AL' => $nacimiento ? "=AL\$2-AK{$r}" : null,
                'AM' => $m->tipo_documento,
                'AN' => $this->numero($m->numero_documento),
                'AY' => $m->tiene_foto ? 'S' : 'N',
                'AZ' => $m->acudiente,
                'BA' => $this->numero($m->acudiente_documento),
                'BB' => $m->parentesco === 'Otro' && $m->parentesco_otro ? $m->parentesco_otro : $m->parentesco,
                'BC' => $m->acudiente_direccion,
                'BD' => $m->barrio,
                'BE' => $this->numero($m->telefono_fijo),
                'BF' => $this->numero($m->telefono_celular),
                'BG' => $m->observaciones,
            ];
            foreach ($valores as $col => $v) {
                if ($v !== null && $v !== '') {
                    $h->setCellValue("{$col}{$r}", $v);
                }
            }
            // Historia: grupo y sede de cada año; «No» si no estaba en el colegio.
            $suya = $historia->get($m->estudiante_id, collect());
            for ($i = 0; $i < self::AÑOS_DE_HISTORIA; $i++) {
                $c = self::C_PRIMER_ANIO + 2 * $i;
                $fila = $suya->get($primerAnio + $i);
                $h->setCellValueExplicit($this->col($c).$r, $fila ? ($fila->grupo ?? "{$fila->grado}°") : 'No',
                    DataType::TYPE_STRING);
                if ($fila?->sede) {
                    $h->setCellValueExplicit($this->col($c + 1).$r, $fila->sede, DataType::TYPE_STRING);
                }
            }
            // Boletines: como en el original, un «NO APLICA» sin más entregas después ocupa hasta el 10.º.
            $suyos = $boletines->get($m->id, collect());
            foreach ($suyos as $numero => $valor) {
                $c = self::C_BOLETIN + (int) $numero - 1;
                $h->setCellValue($this->col($c).$r, $valor);
                if (strtoupper($valor) === 'NO APLICA' && $numero < 10 && $suyos->keys()->max() == $numero) {
                    $h->mergeCells($this->col($c).$r.':AX'.$r);
                }
            }
        }

        // Estilo de las filas de estudiantes.
        $h->getStyle("A3:BG{$ultima}")->applyFromArray($this->estilo(12, false, null, Border::BORDER_THIN));
        $h->getStyle("A3:A{$ultima}")->getFont()->setSize(10);
        foreach (['F', 'AZ', 'BC'] as $col) {
            $h->getStyle("{$col}3:{$col}{$ultima}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_GENERAL);
        }
        $h->getStyle("BG3:BG{$ultima}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $h->getStyle("I3:AF{$ultima}")->getNumberFormat()->setFormatCode('@');
        $h->getStyle("AN3:AN{$ultima}")->getNumberFormat()->setFormatCode('#,##0');
        $h->getStyle("AN3:AN{$ultima}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $h->getStyle("BA3:BA{$ultima}")->getNumberFormat()->setFormatCode('#,##0;[Red]#,##0');
        $h->getStyle("BE3:BF{$ultima}")->getNumberFormat()->setFormatCode('#\ ###\ ###0');
        $h->getStyle("BA3:BF{$ultima}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        for ($r = 3; $r <= $ultima; $r++) {
            $h->getRowDimension($r)->setRowHeight(15.75);
        }

        // --- totales (las mismas fórmulas del libro original)
        $t = $ultima + 3;
        $totales = [
            [$t, 'TOTAL ESTUDIANTES MATRICULADOS', '=A'.($t + 2).'+A'.($t + 4), null],
            [$t + 2, 'TOTAL ESTUDIANTES ANTIGUOS MATRICULADOS', "=SUM(A3:A{$ultima})-A".($t + 4), null],
            [$t + 4, 'TOTAL ESTUDIANTES NUEVOS MATRICULADOS', "=SUMIF({$previo}3:{$previo}{$ultima},\"No\",A3:A{$ultima})", null],
            [$t + 6, 'TOTAL ESTUDIANTES RETIRADOS', "=COUNTIF(A3:A{$ultima},\"R\")", self::NARANJA],
        ];
        foreach ($totales as [$r, $texto, $formula, $relleno]) {
            $h->mergeCells("A{$r}:B{$r}");
            $h->mergeCells("C{$r}:F{$r}");
            $h->setCellValue("A{$r}", $formula);
            $h->setCellValue("C{$r}", $texto);
            $h->getRowDimension($r)->setRowHeight(37.5);
            $h->getStyle("A{$r}:F{$r}")->applyFromArray($this->estilo(16, false, $relleno, Border::BORDER_MEDIUM));
            $h->getStyle("A{$r}")->getFont()->setBold(true);
        }

        // BG2, bajo OBSERVACIONES, lleva el director del grupo, como en el original.
        if ($g->director) {
            $h->setCellValue('BG2', $g->director);
        }

        // Fila 1: cupo del grupo (B1) y cupos disponibles (A1), en rojo si ya no quedan.
        $h->setCellValue('B1', (int) $g->cupos);
        $h->setCellValue('A1', "=B1-A{$t}");
        $rojo = (new Conditional)->setConditionType(Conditional::CONDITION_CELLIS)->setOperatorType(Conditional::OPERATOR_LESSTHANOREQUAL)
            ->addCondition('0');
        $rojo->getStyle()->getFont()->getColor()->setARGB('FF9C0006');
        $rojo->getStyle()->getFill()->setFillType(Fill::FILL_SOLID)->getEndColor()->setARGB('FFFFC7CE');
        $h->getStyle('A1:A2')->setConditionalStyles([$rojo]);

        // Listas para escribir a mano, desde la hoja NO TOCAR.
        $this->lista($h, "D3:D{$ultima}", "'NO TOCAR'!\$B\$3:\$B\$14");
        $this->lista($h, "AM3:AM{$ultima}", "'NO TOCAR'!\$D\$3:\$D\$8");
        $this->lista($h, "AY3:AY{$ultima}", "'NO TOCAR'!\$E\$3:\$E\$4");
        $this->lista($h, "BB3:BB{$ultima}", "'NO TOCAR'!\$F\$3:\$F\$10");
        $this->lista($h, "AH3:AH{$ultima}", "'NO TOCAR'!\$G\$3:\$G\$4");

        // Anchos del libro original.
        $anchos = ['A' => 4.29, 'B' => 4.29, 'C' => 7.14, 'D' => 10.71, 'E' => 7.14, 'F' => 40, 'G' => 21.43, 'H' => 14.57,
            'AG' => 10.71, 'AH' => 8.57, 'AI' => 7.14, 'AN' => 15.71, 'AO' => 3.57, 'AY' => 7.14, 'AZ' => 40, 'BA' => 14.29,
            'BB' => 14.29, 'BC' => 28.57, 'BE' => 14.43, 'BG' => 92.86];
        for ($i = 0; $i < self::AÑOS_DE_HISTORIA; $i++) {
            $anchos[$this->col(self::C_PRIMER_ANIO + 2 * $i)] = 5.71;
            $anchos[$this->col(self::C_PRIMER_ANIO + 2 * $i + 1)] = 2.86;
        }
        foreach ($anchos as $col => $ancho) {
            $h->getColumnDimension($col)->setWidth($ancho);
        }

        $this->hojas[$g->id] = ['antiguos' => $t + 2, 'nuevos' => $t + 4, 'ultima' => $ultima];
    }

    // ------------------------------------------------------------------ CONSOLIDADO

    private function consolidado(Spreadsheet $libro, Collection $grupos): void
    {
        $h = new Worksheet($libro, 'CONSOLIDADO');
        $libro->addSheet($h);
        $h->setShowGridlines(false);
        $anio = $this->anio->anio;

        $h->setCellValue('B2', "MATRÍCULA AÑO LECTIVO {$anio}")->mergeCells('B2:J2');
        $h->setCellValue('B3', 'SEDE '.Str::upper($this->sede->nombre))->mergeCells('B3:J3');
        $h->setCellValue('B4', '=TODAY()')->mergeCells('B4:J4');
        $h->getStyle('B2:J3')->applyFromArray($this->verdana(12, true));
        $h->getStyle('B4:J4')->applyFromArray($this->verdana(10, true));
        $h->getStyle('B4')->getNumberFormat()->setFormatCode('[$-F800]dddd\,\ mmmm\ dd\,\ yyyy');

        $h->setCellValue('B6', 'GRUPOS')->mergeCells('B6:B7');
        $h->setCellValue('C6', "PROYECCIÓN {$anio}")->mergeCells('C6:D7');
        $h->setCellValue('E6', 'ESTUDIANTES MATRICULADOS')->mergeCells('E6:H6');
        $h->setCellValue('I6', 'CUPOS DISPONIBLES')->mergeCells('I6:J7');
        $h->fromArray(['ANTIGUOS', 'NUEVOS', 'POR GRUPO', 'POR GRADO'], null, 'E7');
        $h->getStyle('B6:J7')->applyFromArray($this->verdana(10, true, Border::BORDER_MEDIUM, true));

        // Una fila por grupo; POR GRADO y los disponibles del grado van combinados sobre sus grupos.
        $r = 8;
        foreach ($grupos->groupBy('grado') as $delGrado) {
            $desde = $r;
            foreach ($delGrado as $g) {
                $hoja = "'{$g->codigo}'";
                $h->setCellValue("B{$r}", $g->codigo);
                $h->setCellValue("C{$r}", $g->jornada);
                $h->setCellValue("D{$r}", (int) $g->cupos);
                $h->setCellValue("E{$r}", "={$hoja}!A{$this->hojas[$g->id]['antiguos']}");
                $h->setCellValue("F{$r}", "={$hoja}!A{$this->hojas[$g->id]['nuevos']}");
                $h->setCellValue("G{$r}", "=SUM(E{$r}:F{$r})");
                $h->setCellValue("I{$r}", "=D{$r}-(E{$r}+F{$r})");
                $h->getRowDimension($r)->setRowHeight(15);
                $r++;
            }
            $hasta = $r - 1;
            $h->setCellValue("H{$desde}", "=SUM(G{$desde}:G{$hasta})");
            $h->setCellValue("J{$desde}", "=SUM(I{$desde}:I{$hasta})");
            if ($hasta > $desde) {
                $h->mergeCells("H{$desde}:H{$hasta}");
                $h->mergeCells("J{$desde}:J{$hasta}");
            }
            $h->getStyle("B{$desde}:J{$hasta}")->applyFromArray($this->verdana(10, false, Border::BORDER_THIN));
            $h->getStyle("H{$desde}:H{$hasta}")->getFont()->setBold(true);
            $h->getStyle("J{$desde}:J{$hasta}")->applyFromArray($this->verdana(12, true, Border::BORDER_MEDIUM));
            $h->getStyle("B{$desde}:J{$hasta}")->getBorders()->getOutline()->setBorderStyle(Border::BORDER_MEDIUM);
        }
        $ultimo = $r - 1;

        // Totales, como en el original: el total de matriculados en grande.
        $t = $r;
        $h->setCellValue("B{$t}", 'TOTALES')->mergeCells("B{$t}:C".($t + 3));
        $h->setCellValue("D{$t}", "=SUM(D8:D{$ultimo})")->mergeCells("D{$t}:D".($t + 3));
        foreach (['E', 'F', 'G', 'H'] as $col) {
            $h->setCellValue("{$col}{$t}", "=SUM({$col}8:{$col}{$ultimo})")->mergeCells("{$col}{$t}:{$col}".($t + 1));
        }
        $h->setCellValue('E'.($t + 2), "=SUM(E{$t}:F".($t + 1).')')->mergeCells('E'.($t + 2).':H'.($t + 3));
        $h->setCellValue("I{$t}", "=SUM(I8:I{$ultimo})")->mergeCells("I{$t}:J".($t + 3));
        $h->getStyle("B{$t}:J".($t + 3))->applyFromArray($this->verdana(12, true, Border::BORDER_MEDIUM));
        $h->getStyle('E'.($t + 2))->getFont()->setSize(20);
        $h->getStyle("D{$t}")->getNumberFormat()->setFormatCode('#,##0');
        $h->getRowDimension($t + 2)->setRowHeight(24.75);

        $p = $t + 5;
        $h->setCellValue("B{$p}", 'PORCENTAJE DE MATRÍCULA FRENTE A PROYECCIÓN')->mergeCells("B{$p}:J{$p}");
        $h->setCellValue('B'.($p + 2), '=E'.($t + 2)."/D{$t}")->mergeCells('B'.($p + 2).':J'.($p + 3));
        $h->getStyle("B{$p}:J{$p}")->applyFromArray($this->verdana(10, true, Border::BORDER_MEDIUM));
        $h->getStyle('B'.($p + 2).':J'.($p + 3))->applyFromArray($this->verdana(26, true, Border::BORDER_MEDIUM));
        $h->getStyle('B'.($p + 2))->getNumberFormat()->setFormatCode('0%');

        $j = $p + 5;
        foreach ($grupos->pluck('jornada')->filter()->unique()->values() as $jornada) {
            $h->setCellValue("B{$j}", 'TOTAL GRUPOS JORNADA '.Str::upper($jornada))->mergeCells("B{$j}:H{$j}");
            $h->setCellValue("I{$j}", "=COUNTIF(C8:C{$ultimo},\"{$jornada}\")")->mergeCells("I{$j}:J{$j}");
            $h->getStyle("B{$j}:J{$j}")->applyFromArray($this->verdana(12, true, Border::BORDER_MEDIUM));
            $j++;
        }

        foreach (['A' => 2.14, 'B' => 9.29, 'C' => 8.57, 'D' => 8.43, 'E' => 14.29, 'F' => 10, 'G' => 10, 'H' => 10, 'I' => 7.86, 'J' => 7.86] as $col => $ancho) {
            $h->getColumnDimension($col)->setWidth($ancho);
        }
        $h->getPageSetup()->setPrintArea('B1:J'.($j - 1));
    }

    // ------------------------------------------------------------------ TOTAL MODALIDADES

    private function totalModalidades(Spreadsheet $libro, Collection $grupos, Collection $matriculas): void
    {
        $h = new Worksheet($libro, 'TOTAL MODALIDADES');
        $libro->addSheet($h);
        $h->setShowGridlines(false);
        $modalidades = $matriculas->pluck('modalidad')->filter()->unique()->sort()->values();
        if ($modalidades->isEmpty()) {
            $modalidades = DB::table('modalidades')->orderBy('nombre')->pluck('nombre');
        }
        $colTotal = $this->col(3 + $modalidades->count());

        $r = 2;
        foreach ($grupos->where('grado', '>=', 10)->groupBy('grado') as $delGrado) {
            $h->setCellValue("B{$r}", 'GRUPO');
            foreach ($modalidades as $i => $mod) {
                $h->setCellValue($this->col(3 + $i).$r, $mod);
            }
            $h->setCellValue("{$colTotal}{$r}", 'TOTAL GRUPO');
            $cabecera = $r;
            $r++;
            foreach ($delGrado as $g) {
                $filas = $this->hojas[$g->id]['ultima'];
                $h->setCellValue("B{$r}", $g->codigo);
                foreach ($modalidades as $i => $mod) {
                    $c = $this->col(3 + $i);
                    // Estudiantes activos del grupo en esa modalidad.
                    $h->setCellValue("{$c}{$r}", "=COUNTIFS('{$g->codigo}'!\$H\$3:\$H\${$filas},{$c}\${$cabecera},'{$g->codigo}'!\$A\$3:\$A\${$filas},1)");
                }
                $h->setCellValue("{$colTotal}{$r}", "=SUM(C{$r}:".$this->col(2 + $modalidades->count())."{$r})");
                $r++;
            }
            $h->setCellValue("B{$r}", 'TOTAL');
            foreach (range(3, 3 + $modalidades->count()) as $c) {
                $col = $this->col($c);
                $h->setCellValue("{$col}{$r}", "=SUM({$col}".($cabecera + 1).":{$col}".($r - 1).')');
            }
            $total = $r;
            $h->getStyle("B{$cabecera}:{$colTotal}{$total}")->applyFromArray($this->estilo(11, false, null, Border::BORDER_THIN));
            $h->getStyle("B{$cabecera}:{$colTotal}{$cabecera}")->getFont()->setBold(true)->setItalic(true);
            $h->getStyle("C{$cabecera}:".$this->col(2 + $modalidades->count()).($total - 1))->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB(self::AZUL_MODALIDAD);
            $h->getStyle("{$colTotal}{$cabecera}:{$colTotal}".($total - 1))->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB(self::VERDE_CLARO);
            $h->getStyle("B{$total}:{$colTotal}{$total}")->getFont()->setBold(true)->setItalic(true)->setSize(12);

            // Cupos del grado frente a matriculados.
            $r += 2;
            $h->fromArray(['Cupos Proyectados', 'Matriculados', 'Cupos Disponibles', 'Aulas'], null, "C{$r}");
            $h->getStyle("C{$r}:F{$r}")->applyFromArray($this->estilo(12, true, null, Border::BORDER_MEDIUM, true));
            $h->getRowDimension($r)->setRowHeight(32.25);
            $r++;
            $cupos = $delGrado->sum('cupos');
            $h->setCellValue("C{$r}", (int) $cupos);
            $h->setCellValue("D{$r}", "={$colTotal}{$total}");
            $h->setCellValue("E{$r}", "=C{$r}-D{$r}");
            $h->setCellValue("F{$r}", "=D{$r}/36");
            $h->getStyle("C{$r}:F{$r}")->applyFromArray($this->estilo(11, false, null, Border::BORDER_THIN));
            $h->getStyle("F{$r}")->getNumberFormat()->setFormatCode('0.0;[Red]0.0');
            $r += 4;
        }

        foreach (['A' => 2.71, 'B' => 12.14] as $col => $ancho) {
            $h->getColumnDimension($col)->setWidth($ancho);
        }
        foreach (range(3, 3 + $modalidades->count()) as $c) {
            $h->getColumnDimension($this->col($c))->setWidth(14.29);
        }
    }

    // ------------------------------------------------------------------ DIRECTORES y NO TOCAR

    private function directores(Spreadsheet $libro, Collection $grupos): void
    {
        $h = new Worksheet($libro, 'DIRECTORES DE GRUPO');
        $libro->addSheet($h);
        $h->setCellValue('B2', "Año Lectivo {$this->anio->anio}")->mergeCells('B2:D2');
        $h->getStyle('B2:D2')->applyFromArray($this->verdana(10, true, Border::BORDER_MEDIUM));
        $r = 3;
        foreach ($grupos as $g) {
            $h->fromArray([$g->codigo, $g->jornada, $g->director], null, "B{$r}");
            $r++;
        }
        if ($r > 3) {
            $h->getStyle('B3:D'.($r - 1))->applyFromArray($this->verdana(10, false, Border::BORDER_THIN));
            $h->getStyle('D3:D'.($r - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        }
        $h->getColumnDimension('B')->setWidth(11.43);
        $h->getColumnDimension('D')->setWidth(37.14);
    }

    private function noTocar(Spreadsheet $libro, Collection $grupos): void
    {
        $h = new Worksheet($libro, 'NO TOCAR');
        $libro->addSheet($h);
        $h->setCellValue('A1', 'FECHA MATRÍCULA')->mergeCells('A1:C1');
        $h->fromArray(['DÍA', 'MES', 'DÍA'], null, 'A2');
        foreach (['D1' => 'TIPO DOC', 'E1' => 'FOTOS', 'F1' => 'PARENTESCO', 'G1' => 'GENERO', 'H1' => 'GRADO'] as $celda => $texto) {
            $h->setCellValue($celda, $texto)->mergeCells($celda.':'.$celda[0].'2');
        }
        $h->setCellValue('I1', 'EDAD')->mergeCells('I1:J1');
        $h->fromArray(['ENTRE', 'Y'], null, 'I2');
        $h->getStyle('A1:J2')->applyFromArray($this->estilo(12, true, self::VERDE, Border::BORDER_MEDIUM, true));

        $listas = [
            'A' => range(1, 31),
            'B' => self::MESES,
            'C' => range(1, 12),
            'D' => ['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'Otro'],
            'E' => ['S', 'N'],
            'F' => self::PARENTESCOS,
            'G' => ['F', 'M'],
        ];
        // Grados de la sede y su rango de edad esperado.
        $grados = $grupos->pluck('grado')->unique()->sort()->values();
        $listas['H'] = $grados->map(fn ($n) => "{$n}°")->all();
        $listas['I'] = $grados->map(fn ($n) => $n + 5)->all();
        $listas['J'] = $grados->map(fn ($n) => $n + 6)->all();
        foreach ($listas as $col => $valores) {
            foreach (array_values($valores) as $i => $v) {
                $h->setCellValue($col.(3 + $i), $v);
            }
        }
        $h->getStyle('A3:J33')->applyFromArray(['font' => ['size' => 12, 'italic' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        foreach (['A' => 7.14, 'B' => 10.71, 'C' => 7.29, 'D' => 7.14, 'F' => 14.29, 'G' => 11.43, 'H' => 11.43] as $col => $ancho) {
            $h->getColumnDimension($col)->setWidth($ancho);
        }
    }

    // ------------------------------------------------------------------ utilidades

    private function col(int $n): string
    {
        return Coordinate::stringFromColumnIndex($n);
    }

    /** Documento o teléfono: número si son solo dígitos (con el formato del libro); si no, el texto tal cual. */
    private function numero(?string $valor): int|string|null
    {
        if ($valor === null || trim($valor) === '') {
            return null;
        }
        $digitos = preg_replace('/\D/', '', $valor);

        return $digitos !== '' && $digitos[0] !== '0' && strlen($digitos) <= 15 && preg_replace('/[\s.\-]/', '', $valor) === $digitos ? (int) $digitos : trim($valor);
    }

    private function lista(Worksheet $h, string $rango, string $origen): void
    {
        $v = $h->getCell(explode(':', $rango)[0])->getDataValidation();
        $v->setType(DataValidation::TYPE_LIST)->setAllowBlank(true)->setShowDropDown(true)->setShowErrorMessage(false)->setFormula1($origen);
        $h->setDataValidation($rango, $v);
    }

    /** Calibri en cursiva, centrado, con bordes; el encabezado además en negrita y con relleno. */
    private function estilo(float $tamano, bool $negrita, ?string $relleno, string $borde, bool $ajustar = false): array
    {
        return [
            'font' => ['name' => 'Calibri', 'size' => $tamano, 'bold' => $negrita, 'italic' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => $ajustar],
            'borders' => ['allBorders' => ['borderStyle' => $borde]],
            'fill' => $relleno ? ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $relleno]] : ['fillType' => Fill::FILL_NONE],
        ];
    }

    /** Verdana en cursiva, como las hojas de resumen del libro original. */
    private function verdana(float $tamano, bool $negrita, ?string $borde = null, bool $ajustar = false): array
    {
        return [
            'font' => ['name' => 'Verdana', 'size' => $tamano, 'bold' => $negrita, 'italic' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => $ajustar],
            'borders' => $borde ? ['allBorders' => ['borderStyle' => $borde]] : [],
        ];
    }
}
