import { type Documento, type Graduacion, HojaActa, HojaDiploma, type Institucion, type Programa } from '@/components/acta-grado';
import { DesplegableBuscable } from '@/components/desplegable-buscable';
import { Cabeza, Cuerpo, type EstadoDialogo, Marco, Pie, exito, revisar, useAvisar } from '@/components/dialogo-formulario';
import { Campo, botonPrimario, botonSecundario, claseCampo } from '@/components/formulario';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CircleAlert, NotebookPen, Printer } from 'lucide-react';
import { type FormEventHandler, type RefObject, useId, useState } from 'react';

type SinModalidad = { id: number; nombre: string; grupo: string | null };

type Props = {
    anio: number;
    programas: Programa[];
    sinModalidad: SinModalidad[];
    graduacion: Graduacion;
    institucion: Institucion;
    volver: string;
    /** El programa con que abre (?programa=ciclos desde la pestaña de la jornada sabatina). */
    programa: string | null;
};

const TODOS = 0;

const segmento = (activo: boolean) =>
    cn(
        'focus-visible:outline-foco h-7 cursor-pointer rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
        activo ? 'bg-white text-[#1E3A7B] shadow-[0_1px_2px_rgba(22,34,63,0.12)]' : 'text-[#56627F] hover:text-[#16223F]',
    );

/**
 * Actas de grado y diplomas de undécimo: se elige el programa (cada modalidad o los
 * ciclos), el documento y todos o un graduando; vista previa hoja por hoja e
 * «Imprimir» (ver @page acta y diploma en app.css). Los datos del grado (fecha,
 * firmas, acta, libro y folio) se llenan una vez por año.
 */
export default function ActasGrado({ anio, programas, sinModalidad, graduacion, institucion, volver, programa: pedido }: Props) {
    const [clave, setClave] = useState((programas.find((p) => p.clave === pedido) ?? programas[0])?.clave ?? '');
    const [documento, setDocumento] = useState<Documento>('acta');
    const [elegido, setElegido] = useState(TODOS);
    const [editando, setEditando] = useState(false);

    const programa = programas.find((p) => p.clave === clave) ?? programas[0];
    const graduandos = programa ? (elegido === TODOS ? programa.graduandos : programa.graduandos.filter((g) => g.matricula === elegido)) : [];
    const datos = programa ? graduacion.actas[programa.clave] : undefined;
    const faltan = [
        !graduacion.fecha && 'la fecha del grado',
        !graduacion.rector && `el nombre de ${graduacion.cargo_rector.toLowerCase()}`,
        !graduacion.secretario && `el nombre del ${graduacion.cargo_secretario.toLowerCase()}`,
        documento === 'acta' && !datos?.acta && 'el número del acta',
        documento === 'diploma' && !datos?.libro && 'el libro',
        documento === 'diploma' && !datos?.folio && 'el folio',
    ].filter((f): f is string => !!f);
    const Hoja = documento === 'acta' ? HojaActa : HojaDiploma;
    const n = graduandos.length;

    return (
        <>
            {/* El título es el nombre que propone el navegador para el PDF. */}
            <Head title={`${documento === 'acta' ? 'Actas de grado' : 'Diplomas'} · ${programa?.nombre ?? ''} · ${anio}`}>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Pinyon+Script&family=UnifrakturMaguntia&display=swap"
                />
            </Head>

            <div className="min-h-screen bg-[#DDE3EE] font-sans text-[#16223F] print:bg-white">
                <div className="sticky top-0 z-20 border-b border-[#E3E9F6] bg-white/90 backdrop-blur print:hidden">
                    <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-8">
                        <Link
                            href={volver}
                            aria-label="Volver"
                            className="focus-visible:outline-foco inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pr-3.5 pl-2.5 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">Volver</span>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em]">Actas de grado · {anio}</h1>
                            <p className="truncate text-[12.5px] text-[#56627F]">
                                {programas.reduce((t, p) => t + p.graduandos.length, 0).toLocaleString('es-CO')} graduandos de undécimo ·{' '}
                                {n === 1 ? '1 hoja' : `${n} hojas`} {documento === 'acta' ? 'carta' : 'oficio'}
                            </p>
                        </div>

                        <div className="ml-auto flex flex-wrap items-center gap-2">
                            <div role="radiogroup" aria-label="Documento" className="flex h-9 items-center rounded-full bg-[#EEF2FB] p-1">
                                {(['acta', 'diploma'] as const).map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        role="radio"
                                        aria-checked={documento === d}
                                        onClick={() => setDocumento(d)}
                                        className={segmento(documento === d)}
                                    >
                                        {d === 'acta' ? 'Acta' : 'Diploma'}
                                    </button>
                                ))}
                            </div>
                            {programa && (
                                <DesplegableBuscable
                                    etiqueta="Graduando"
                                    valor={elegido}
                                    onCambio={setElegido}
                                    placeholder="Buscar por nombre o grupo…"
                                    alinear="derecha"
                                    opciones={[
                                        { valor: TODOS, etiqueta: `Todos (${programa.graduandos.length})` },
                                        ...programa.graduandos.map((g) => ({
                                            valor: g.matricula,
                                            etiqueta: g.nombre,
                                            detalle: g.grupo ?? undefined,
                                        })),
                                    ]}
                                    claseBoton={cn(claseCampo, 'h-9 w-[240px] py-0 text-[13.5px]')}
                                />
                            )}
                            <button type="button" onClick={() => setEditando(true)} className={cn(botonSecundario, 'h-9')}>
                                <NotebookPen className="size-4" />
                                Datos del grado
                            </button>
                            <button type="button" onClick={() => window.print()} disabled={n === 0} className={botonPrimario}>
                                <Printer className="size-[18px]" />
                                Imprimir
                            </button>
                        </div>
                    </div>

                    {programas.length > 0 && (
                        <div
                            className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 pt-1 pb-3.5 md:px-8"
                            role="radiogroup"
                            aria-label="Modalidad"
                        >
                            {programas.map((p) => (
                                <button
                                    key={p.clave}
                                    type="button"
                                    role="radio"
                                    aria-checked={p.clave === programa?.clave}
                                    onClick={() => {
                                        setClave(p.clave);
                                        setElegido(TODOS);
                                    }}
                                    className={cn(
                                        'focus-visible:outline-foco flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
                                        p.clave === programa?.clave
                                            ? 'bg-[#1E3A7B] text-white ring-[#1E3A7B]'
                                            : 'bg-white text-[#3E4A68] ring-[#D3DDF3] hover:bg-[#F7F9FD]',
                                    )}
                                >
                                    {p.nombre}
                                    <span className={cn('tabular-nums', p.clave === programa?.clave ? 'text-white/75' : 'text-[#6B7690]')}>
                                        {p.graduandos.length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {programa && faltan.length > 0 && (
                        <p className="flex items-center justify-center gap-2 border-t border-[#F1E3C4] bg-[#FFF8E8] px-4 py-2 text-center text-[13px] text-[#6B4E12]">
                            <CircleAlert className="size-4 shrink-0" />
                            Falta {faltan.join(', ').replace(/, ([^,]*)$/, ' y $1')}: sale en blanco. Llénalo en «Datos del grado».
                        </p>
                    )}
                    {sinModalidad.length > 0 && (
                        <p className="flex items-center justify-center gap-2 border-t border-[#F1E3C4] bg-[#FFF8E8] px-4 py-2 text-center text-[13px] text-[#6B4E12]">
                            <CircleAlert className="size-4 shrink-0" />
                            {sinModalidad.length === 1
                                ? '1 estudiante de once no tiene modalidad'
                                : `${sinModalidad.length} estudiantes de once no tienen modalidad`}{' '}
                            y no sale en ninguna acta:{' '}
                            {sinModalidad
                                .slice(0, 3)
                                .map((e) => `${e.nombre}${e.grupo ? ` (${e.grupo})` : ''}`)
                                .join(', ')}
                            {sinModalidad.length > 3 ? '…' : '.'} Se asigna en su ficha.
                        </p>
                    )}
                </div>

                <main className="flex flex-col [align-items:safe_center] gap-6 overflow-x-auto px-4 py-8 print:block print:overflow-visible print:p-0">
                    {!programa ? (
                        <p className="mt-16 text-[15px] text-[#56627F]">No hay graduandos de undécimo en {anio}.</p>
                    ) : (
                        graduandos.map((g) => (
                            <div key={g.matricula} className="contents">
                                <Hoja programa={programa} graduando={g} graduacion={graduacion} institucion={institucion} anio={anio} />
                            </div>
                        ))
                    )}
                </main>
            </div>

            <Marco abierto={editando} onCambio={setEditando} className="max-w-[560px]">
                {(estado) => (
                    <DatosDelGrado anio={anio} programas={programas} graduacion={graduacion} estado={estado} onCerrar={() => setEditando(false)} />
                )}
            </Marco>
        </>
    );
}

type CampoActa = 'acta' | 'libro' | 'folio' | 'primero' | 'ultimo';

type FormGrado = Omit<Graduacion, 'actas'> & { actas: Record<string, Record<CampoActa, string>> };

function DatosDelGrado({
    anio,
    programas,
    graduacion,
    estado,
    onCerrar,
}: {
    anio: number;
    programas: Programa[];
    graduacion: Graduacion;
    estado: RefObject<EstadoDialogo>;
    onCerrar: () => void;
}) {
    const form = useForm<FormGrado>({
        fecha: graduacion.fecha ?? '',
        rector: graduacion.rector ?? '',
        cargo_rector: graduacion.cargo_rector,
        secretario: graduacion.secretario ?? '',
        cargo_secretario: graduacion.cargo_secretario,
        actas: Object.fromEntries(
            programas.map((p) => {
                const a = graduacion.actas[p.clave];
                return [
                    p.clave,
                    { acta: a?.acta ?? '', libro: a?.libro ?? '', folio: a?.folio ?? '', primero: a?.primero ?? '', ultimo: a?.ultimo ?? '' },
                ];
            }),
        ),
    });
    const prefijo = useId();
    const id = (campo: string) => `${prefijo}-${campo}`;
    useAvisar(estado, form.isDirty, form.processing);
    const error = (campo: string) => (form.errors as Record<string, string | undefined>)[campo];

    const texto = (campo: 'rector' | 'cargo_rector' | 'secretario' | 'cargo_secretario', etiqueta: string, ejemplo: string, opcional = false) => (
        <Campo id={id(campo)} etiqueta={etiqueta} error={error(campo)} opcional={opcional}>
            <input
                id={id(campo)}
                value={form.data[campo] ?? ''}
                onChange={(e) => form.setData(campo, e.target.value)}
                aria-invalid={!!error(campo)}
                placeholder={ejemplo}
                autoComplete="off"
                maxLength={campo.startsWith('cargo') ? 60 : 120}
                className={claseCampo}
            />
        </Campo>
    );
    const nombres: Record<CampoActa, string> = { acta: 'Acta N.º', libro: 'Libro', folio: 'Folio', primero: 'Comienza con', ultimo: 'Se cierra con' };
    const deActa = (clave: string, campo: CampoActa, ejemplo: string) => (
        <input
            aria-label={`${nombres[campo]} en ${programas.find((p) => p.clave === clave)?.nombre}`}
            value={form.data.actas[clave][campo]}
            onChange={(e) => form.setData('actas', { ...form.data.actas, [clave]: { ...form.data.actas[clave], [campo]: e.target.value } })}
            aria-invalid={!!error(`actas.${clave}.${campo}`)}
            placeholder={ejemplo}
            autoComplete="off"
            maxLength={campo === 'primero' || campo === 'ultimo' ? 150 : 20}
            className={cn(claseCampo, 'px-3')}
        />
    );

    const guardar: FormEventHandler = (ev) => {
        ev.preventDefault();
        form.put(`/actas-grado/${anio}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (pagina) => {
                onCerrar();
                exito('Datos del grado guardados')(pagina);
            },
            onError: revisar,
        });
    };

    return (
        <form onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
            <Cabeza titulo={`Datos del grado ${anio}`}>Salen en todas las actas y diplomas de este año. Lo que quede vacío sale en blanco.</Cabeza>
            <Cuerpo>
                <div className="grid gap-4">
                    <Campo id={id('fecha')} etiqueta="Fecha del grado" error={error('fecha')}>
                        <input
                            id={id('fecha')}
                            type="date"
                            value={form.data.fecha ?? ''}
                            onChange={(e) => form.setData('fecha', e.target.value)}
                            aria-invalid={!!error('fecha')}
                            className={claseCampo}
                        />
                    </Campo>
                    <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-3">
                        {texto('rector', 'Firma a la izquierda', 'Nombre completo')}
                        {texto('cargo_rector', 'Cargo', 'Rectora')}
                        {texto('secretario', 'Firma a la derecha', 'Nombre completo')}
                        {texto('cargo_secretario', 'Cargo', 'Secretario Académico')}
                    </div>

                    <div>
                        <p className="text-[13px] font-medium text-[#3E4A68]">Acta general de cada modalidad</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-[#56627F]">
                            El número del acta sale en el acta; el libro y el folio, en el diploma.
                        </p>
                        <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_88px_72px_88px] items-center gap-x-2 gap-y-2">
                            <span />
                            <span className="text-[12px] text-[#6B7690]">Acta N.º</span>
                            <span className="text-[12px] text-[#6B7690]">Libro</span>
                            <span className="text-[12px] text-[#6B7690]">Folio</span>
                            {programas.map((p) => (
                                <div key={p.clave} className="contents">
                                    <span className="truncate text-[14px] font-medium">{p.nombre}</span>
                                    {deActa(p.clave, 'acta', '19-1')}
                                    {deActa(p.clave, 'libro', '01')}
                                    {deActa(p.clave, 'folio', '74-01')}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[13px] font-medium text-[#3E4A68]">Con quién comienza y se cierra cada acta</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-[#56627F]">
                            Sale en el acta: «…que comienza con el nombre de… y se cierra con el nombre de…». Vacío, va el primero y el último de la
                            lista en orden alfabético (el que se ve en gris).
                        </p>
                        <div className="mt-2.5 space-y-3">
                            {programas.map((p) => (
                                <div key={p.clave}>
                                    <p className="mb-1.5 text-[14px] font-medium">{p.nombre}</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {(['primero', 'ultimo'] as const).map((c) => (
                                            <label key={c} className="flex min-w-0 flex-col gap-1 text-[12px] text-[#6B7690]">
                                                {nombres[c]}
                                                {deActa(p.clave, c, (c === 'primero' ? p.graduandos[0] : p.graduandos.at(-1))?.nombre ?? '')}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Cuerpo>
            <Pie sucio={form.isDirty} cargando={form.processing} desactivado={!form.isDirty} onCancelar={onCerrar} />
        </form>
    );
}
