import { BotonGuardar, tarjeta } from '@/components/formulario';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { type ResumenFormulario, type ResumenImportacion, type ResumenLibro, type SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, CircleAlert, ClipboardList, FileSpreadsheet, UploadCloud, X } from 'lucide-react';
import { type ChangeEvent, type DragEvent, type FormEventHandler, useState } from 'react';
import { sileo } from 'sileo';

const EXTENSIONES = ['xlsx', 'xls'];
const TAMANO_MAXIMO = 20 * 1024 * 1024;

type Tipo = 'matricula' | 'formulario' | 'ciclos';

/** Los tres formatos que se pueden importar, cada uno en su pestaña (ver ImportacionController). */
const FORMATOS: { tipo: Tipo; titulo: string; icono: typeof BookOpen; descripcion: string; ejemplo: string; carga: string }[] = [
    {
        tipo: 'matricula',
        titulo: 'Libro de matrícula',
        icono: BookOpen,
        descripcion: 'El libro de Excel de una sede, con una hoja por grupo (6-1, 6-2…), como «PRINCIPAL-2026.xlsx».',
        ejemplo: 'PRINCIPAL-2026.xlsx',
        carga: 'Crea los estudiantes, acudientes y matrículas que falten. Lo que ya está en SIEAGE no se cambia.',
    },
    {
        tipo: 'formulario',
        titulo: 'Formulario de inscripción',
        icono: ClipboardList,
        descripcion: 'Las respuestas del formulario de inscripción de Google, descargadas como Excel.',
        ejemplo: 'FORMULARIO DE INSCRIPCIÓN ESTUDIANTE NUEVO….xlsx',
        carga: 'Quedan como inscritos pendientes, listos para revisar y matricular. No se repiten si subes el mismo archivo.',
    },
    {
        tipo: 'ciclos',
        titulo: 'Ciclos (sabatinos)',
        icono: CalendarDays,
        descripcion: 'El libro de los ciclos de la jornada sabatina, con una hoja por ciclo («CICLO III 2026»…), como «SABATINOS-2026.xlsx».',
        ejemplo: 'SABATINOS-2026.xlsx',
        carga: 'Cada ciclo queda en su grado equivalente (III → Séptimo, IV → Noveno, V → Décimo, VI → Undécimo), en jornada Sabatina.',
    },
];

function formatearTamano(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validarArchivo(archivo: File): string | null {
    const extension = archivo.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES.includes(extension)) return 'El archivo debe ser .xlsx o .xls.';
    if (archivo.size > TAMANO_MAXIMO) return 'El archivo no puede superar los 20 MB.';
    return null;
}

/**
 * Importar datos: tres pestañas, una por formato (libro de matrícula, formulario de
 * inscripción, ciclos sabatinos). Se elige la pestaña, se sube el Excel y se carga; al
 * terminar, el resumen de lo que entró. Es poco contenido: va centrado en la ventana.
 */
export default function ImportarDatos() {
    const { flash } = usePage<SharedData>().props;
    const [arrastrando, setArrastrando] = useState(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);
    const form = useForm<{ archivo: File | null; tipo: Tipo }>({ archivo: null, tipo: flash.importacion?.tipo ?? 'matricula' });
    const formato = FORMATOS.find((f) => f.tipo === form.data.tipo)!;

    const seleccionar = (archivo: File | undefined) => {
        if (!archivo) return;
        form.clearErrors();
        const error = validarArchivo(archivo);
        setErrorLocal(error);
        form.setData('archivo', error ? null : archivo);
    };

    const alSoltar = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setArrastrando(false);
        seleccionar(e.dataTransfer.files[0]);
    };

    const alCambiar = (e: ChangeEvent<HTMLInputElement>) => {
        seleccionar(e.target.files?.[0]);
        e.target.value = '';
    };

    const quitar = () => {
        form.setData('archivo', null);
        form.clearErrors();
        setErrorLocal(null);
    };

    const elegirTipo = (tipo: Tipo) => {
        form.setData('tipo', tipo);
        form.clearErrors();
    };

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('importaciones.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (pagina) => {
                form.setData('archivo', null);
                const r = (pagina.props as unknown as SharedData).flash.importacion;
                if (r?.tipo === 'formulario')
                    sileo.success({ title: `${r.creadas} inscripciones importadas`, description: `Quedaron pendientes en Inscritos (${r.anio}).` });
                else if (r)
                    sileo.success({
                        title: `${r.matriculas} matrículas cargadas`,
                        description: `${r.estudiantesNuevos} estudiantes nuevos · ${r.anio}.`,
                    });
            },
            onError: (e) => sileo.warning({ title: 'No se importó', description: e.archivo ?? e.tipo ?? 'Revisa el archivo.' }),
        });
    };

    const error = errorLocal ?? form.errors.archivo ?? form.errors.tipo;
    const archivo = form.data.archivo;

    return (
        <PanelLayout titulo="Importar datos">
            {/* Ocupa del encabezado al borde de abajo y centra el contenido; el pb lo sube un poco del centro exacto. */}
            <div className="relative mx-auto flex w-full max-w-[720px] flex-col justify-center py-6 md:-mb-10 md:min-h-[calc(100dvh-82px)] [@media(min-height:720px)]:md:pb-[6vh]">
                <h1 className="text-center text-[28px] leading-8 font-bold tracking-[-0.025em]">Importar datos</h1>
                <p className="mx-auto mt-2 max-w-[520px] text-center text-[15px] text-balance text-[#56627F]">
                    Elige qué formato vas a importar y sube el Excel.
                </p>

                {flash.importacion && !archivo && <Resumen r={flash.importacion} />}

                <form onSubmit={enviar} className={cn(tarjeta, 'mt-6')}>
                    {/* Las tres pestañas: cuál formato. */}
                    <div role="tablist" aria-label="Formato del archivo" className="grid grid-cols-3 gap-1 border-b border-[#EEF2F9] p-2">
                        {FORMATOS.map((f) => {
                            const activa = f.tipo === form.data.tipo;
                            const Icono = f.icono;
                            return (
                                <button
                                    key={f.tipo}
                                    type="button"
                                    role="tab"
                                    aria-selected={activa}
                                    onClick={() => elegirTipo(f.tipo)}
                                    disabled={form.processing}
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center gap-1.5 rounded-[14px] px-2 py-3 text-center text-[14px] font-semibold transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none sm:flex-row sm:justify-center sm:gap-2',
                                        activa ? 'bg-[#EEF2FB] text-[#1E3A7B]' : 'text-[#56627F] hover:bg-[#F7F9FF] hover:text-[#1E3A7B]',
                                    )}
                                >
                                    <Icono className="size-[18px] shrink-0" />
                                    {f.titulo}
                                </button>
                            );
                        })}
                    </div>

                    <div role="tabpanel" className="p-6">
                        <div className="mb-4 rounded-[14px] bg-[#F7F9FF] px-4 py-3 text-[14px] text-[#3E4A68]">
                            <p>{formato.descripcion}</p>
                            <p className="mt-1 text-[13px] text-[#56627F]">{formato.carga}</p>
                        </div>

                        {!archivo ? (
                            <label
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setArrastrando(true);
                                }}
                                onDragLeave={() => setArrastrando(false)}
                                onDrop={alSoltar}
                                className={cn(
                                    'group flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed px-6 py-9 text-center transition duration-200 focus-within:ring-4 focus-within:ring-[#DCE5F8] [@media(min-height:720px)]:py-12',
                                    arrastrando
                                        ? 'scale-[1.01] border-[#1E3A7B] bg-[#EEF2FB]'
                                        : error
                                          ? 'border-[#E0897D] bg-[#FDF3F1]'
                                          : 'border-[#C4D2F1] bg-[#F7F9FF] hover:border-[#6E8BD6] hover:bg-[#EEF2FB]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-[#1E3A7B] ring-1 ring-[#DCE5F8] transition-transform',
                                        arrastrando ? 'scale-110' : 'group-hover:scale-105',
                                    )}
                                >
                                    <UploadCloud className="size-6" />
                                </span>
                                <span className="text-[16px] font-semibold text-[#16223F]">
                                    {arrastrando ? 'Suelta el archivo aquí' : `Arrastra aquí el Excel: ${formato.titulo.toLowerCase()}`}
                                </span>
                                <span className="mt-1 text-[14px] text-[#56627F]">
                                    o <span className="font-medium text-[#1E3A7B] underline underline-offset-4">haz clic para elegirlo</span>
                                </span>
                                <span className="mt-5 text-[13px] text-[#5E6983]">Por ejemplo «{formato.ejemplo}» · .xlsx o .xls · máximo 20 MB</span>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                    onChange={alCambiar}
                                    className="sr-only"
                                />
                            </label>
                        ) : (
                            <div className="rounded-[16px] bg-[#F5F7FC] p-4">
                                <div className="flex items-center gap-4">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-[#E3F4EC] text-[#1C6B4A]">
                                        <FileSpreadsheet className="size-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[15px] font-semibold text-[#16223F]">{archivo.name}</p>
                                        <p className="text-[13px] text-[#56627F]">
                                            {formatearTamano(archivo.size)} · se importará como <b className="font-semibold">{formato.titulo}</b>
                                            {form.processing && ` · subiendo ${form.progress?.percentage ?? 0} %`}
                                        </p>
                                    </div>
                                    {!form.processing && (
                                        <button
                                            type="button"
                                            onClick={quitar}
                                            aria-label="Quitar el archivo"
                                            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#56627F] transition hover:bg-white hover:text-[#16223F]"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                                {form.processing && (
                                    <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-[#E3E9F6]">
                                        <div
                                            className="h-full rounded-full bg-[#1E3A7B] transition-all duration-300"
                                            style={{ width: `${form.progress?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="mt-3 text-center text-[14px] text-[#B42318]">{error}</p>}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F9] px-6 py-3.5">
                        <span className="mr-auto text-[14px] text-[#56627F]">Se puede subir el mismo archivo otra vez: no duplica nada.</span>
                        <BotonGuardar cargando={form.processing} disabled={!archivo}>
                            {form.processing ? 'Importando…' : 'Importar'}
                        </BotonGuardar>
                    </div>
                </form>
            </div>
        </PanelLayout>
    );
}

function Resumen({ r }: { r: ResumenImportacion }) {
    return r.tipo === 'formulario' ? <ResumenDelFormulario r={r} /> : <ResumenDelLibro r={r} />;
}

/** La caja verde del resumen, con la lista de lo que pasó y los errores. */
function Caja({
    titulo,
    archivo,
    filas,
    errores,
    enlace,
}: {
    titulo: string;
    archivo: string;
    filas: { n: number; texto: string; destacada?: boolean }[];
    errores: { clave: string; texto: string }[];
    enlace?: { href: string; texto: string } | null;
}) {
    return (
        <div className="animate-in fade-in-0 slide-in-from-bottom-1 mt-6 rounded-[20px] bg-[#E3F4EC] px-5 py-4 text-[14px] text-[#1C6B4A] duration-300">
            <p className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="size-[18px] shrink-0" />
                {titulo}
            </p>
            <p className="mt-0.5 truncate pl-[28px] text-[13px] text-[#2F7D5B]">{archivo}</p>
            <ul className="mt-3 space-y-1 pl-[28px]">
                {filas
                    .filter((f) => f.destacada || f.n > 0)
                    .map((f) => (
                        <li key={f.texto} className={cn(f.destacada && 'font-semibold')}>
                            <span className="tabular-nums">{f.n}</span> {f.texto}
                        </li>
                    ))}
            </ul>
            {errores.length > 0 && (
                <div className="mt-3 rounded-[14px] bg-white/70 px-4 py-3 text-[#8A3B12]">
                    <p className="flex items-center gap-2 font-semibold">
                        <CircleAlert className="size-4 shrink-0" />
                        {errores.length === 1 ? '1 fila no se pudo importar' : `${errores.length} filas no se pudieron importar`}
                    </p>
                    <ul className="mt-1.5 max-h-40 space-y-0.5 overflow-y-auto text-[13px]">
                        {errores.map((e) => (
                            <li key={e.clave}>{e.texto}</li>
                        ))}
                    </ul>
                </div>
            )}
            {enlace && (
                <Link
                    href={enlace.href}
                    className="mt-3 ml-[28px] inline-flex items-center gap-1.5 font-semibold text-[#1C6B4A] underline-offset-4 hover:underline"
                >
                    {enlace.texto}
                    <ArrowRight className="size-4" />
                </Link>
            )}
        </div>
    );
}

/** Qué pasó con cada respuesta del formulario de inscripción importado. */
function ResumenDelFormulario({ r }: { r: ResumenFormulario }) {
    return (
        <Caja
            titulo={`Formulario de inscripción ${r.anio} importado`}
            archivo={r.archivo}
            filas={[
                { n: r.creadas, texto: r.creadas === 1 ? 'inscripción creada' : 'inscripciones creadas', destacada: true },
                { n: r.yaEstudian, texto: 'ya estudian en la institución (el formulario les decía que no lo llenaran)' },
                { n: r.repetidas, texto: 'respuestas repetidas del mismo estudiante (quedó la última)' },
                { n: r.yaInscritas, texto: `ya estaban inscritas en ${r.anio} (no se repiten)` },
            ]}
            errores={r.errores.map((e) => ({ clave: String(e.fila), texto: `Fila ${e.fila} · ${e.nombre}: ${e.error}` }))}
            enlace={r.creadas > 0 ? { href: '/inscritos', texto: 'Ver en Inscritos' } : null}
        />
    );
}

/** Qué entró del libro de matrícula o de ciclos. */
function ResumenDelLibro({ r }: { r: ResumenLibro }) {
    return (
        <Caja
            titulo={`${r.tipo === 'ciclos' ? 'Libro de ciclos' : 'Libro de matrícula'}${r.anio ? ` ${r.anio}` : ''} importado · ${r.hojas} ${r.hojas === 1 ? 'hoja' : 'hojas'}`}
            archivo={r.archivo}
            filas={[
                { n: r.matriculas, texto: r.matriculas === 1 ? 'matrícula nueva' : 'matrículas nuevas', destacada: true },
                { n: r.estudiantesNuevos, texto: r.estudiantesNuevos === 1 ? 'estudiante nuevo en SIEAGE' : 'estudiantes nuevos en SIEAGE' },
                { n: r.yaMatriculados, texto: `ya estaban matriculados en ${r.anio ?? 'ese año'} (se dejaron como estaban)` },
                { n: r.acudientesNuevos, texto: r.acudientesNuevos === 1 ? 'acudiente nuevo' : 'acudientes nuevos' },
                { n: r.grupos, texto: r.grupos === 1 ? 'grupo creado' : 'grupos creados' },
                { n: r.historicas, texto: 'matrículas de años anteriores (de las columnas «GRUPO…»)' },
            ]}
            errores={r.errores.map((e) => ({ clave: `${e.hoja}-${e.fila}`, texto: `${e.hoja} · fila ${e.fila} · ${e.nombre}: ${e.error}` }))}
            enlace={r.matriculas > 0 && r.anio ? { href: `/estudiantes?anio=${r.anio}`, texto: 'Ver en Estudiantes' } : null}
        />
    );
}
