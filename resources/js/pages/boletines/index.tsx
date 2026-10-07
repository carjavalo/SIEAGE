import {
    ANCHO,
    desenvolver,
    ESPACIADO,
    type EstudianteBoletin,
    type GrupoBoletin,
    HojaBoletin,
    paginar,
    parrafos,
    TAMANOS,
} from '@/components/boletin';
import { Desplegable } from '@/components/desplegable';
import { claseLista } from '@/components/dialogo-formulario';
import { botonPrimario, botonSecundario, Campo, claseCampo } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PanelLayout from '@/layouts/panel-layout';
import { hace } from '@/lib/inscritos';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronDown, ChevronUp, CircleAlert, CloudOff, Copy, LoaderCircle, PenLine, Printer, UserPen, UserPlus } from 'lucide-react';
import { type FormEventHandler, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { sileo } from 'sileo';

type GrupoLista = { id: number; codigo: string; jornada: string; sede_id: number; sede: string; sede_codigo: string; activos: number };
type Periodo = { id: number; numero: number; etiqueta: string };
type Usuario = { id: number; name: string; rol: string | null };

type Props = {
    anio: number;
    grupos: GrupoLista[];
    periodos: Periodo[];
    periodo: number | null;
    grupo: GrupoBoletin | null;
    estudiantes: EstudianteBoletin[];
    ver: number | null;
    maximo: number;
    puedeConfigurar: boolean;
    puedeCrearFirmantes: boolean;
    usuarios: Usuario[];
};

/** Lo guardado de cada estudiante: el texto y la versión con la que se compara al guardar. */
type Guardado = { texto: string; version: string | null; por: string | null; en: string | null };
type Estado = 'guardado' | 'pendiente' | 'guardando' | 'error' | 'conflicto';
type Conflicto = { matricula: number; texto: string; version: string | null; por: string | null; en: string | null };

const xsrf = () => decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
const cabeceras = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-XSRF-TOKEN': xsrf(),
    'X-Requested-With': 'XMLHttpRequest',
});
const tituloPeriodo = (p: Periodo) => p.etiqueta.charAt(0) + p.etiqueta.slice(1).toLowerCase();

/**
 * Boletines de transición de un grupo: a la izquierda los estudiantes, a la
 * derecha la hoja tal como se imprime, y se escribe directo sobre ella. El texto
 * se guarda solo; si otra persona lo cambió mientras tanto, no se pisa.
 */
export default function Boletines(props: Props) {
    const { anio, grupos, periodos, periodo, grupo } = props;
    const periodoActual = periodos.find((p) => p.id === periodo) ?? null;

    if (!grupo || !periodoActual) {
        return (
            <PanelLayout titulo="Boletines">
                <div className="mx-auto mt-16 max-w-md text-center">
                    <h1 className="text-xl font-semibold">Boletines de transición</h1>
                    <p className="mt-2 text-[15px] text-[#56627F]">
                        {grupos.length === 0
                            ? `No hay grupos de transición en ${anio} en tus sedes.`
                            : `No hay periodos creados para ${anio}: pídele a coordinación que los configure.`}
                    </p>
                    <Link href="/estudiantes" className={cn(botonSecundario, 'mx-auto mt-6 w-fit')}>
                        Volver a Estudiantes
                    </Link>
                </div>
            </PanelLayout>
        );
    }

    // Al cambiar de grupo o de periodo todo vuelve a empezar (la página llega con otros datos).
    return <Editor key={`${grupo.id}-${periodoActual.id}`} {...props} grupo={grupo} periodoActual={periodoActual} />;
}

function Editor({
    anio,
    grupos,
    periodos,
    periodoActual,
    grupo,
    estudiantes,
    ver,
    maximo,
    puedeConfigurar,
    puedeCrearFirmantes,
    usuarios,
}: Props & { grupo: GrupoBoletin; periodoActual: Periodo }) {
    const { auth } = usePage<SharedData>().props;
    const inicial = () =>
        Object.fromEntries(
            estudiantes.map((e) => [e.matricula_id, { texto: e.texto, version: e.version, por: e.actualizado_por, en: e.actualizado_en }]),
        );
    // Lo último que el servidor confirmó de cada uno: lo que se muestra (estado) y con qué se compara al guardar (ref, siempre al día).
    const [guardados, setGuardados] = useState<Record<number, Guardado>>(inicial);
    const confirmado = useRef<Record<number, Guardado>>(guardados);
    // Lo que hay escrito ahora en cada uno (puede ir adelante de lo guardado).
    const textos = useRef<Record<number, string>>(Object.fromEntries(estudiantes.map((e) => [e.matricula_id, e.texto])));
    const [elegido, setElegido] = useState<number | null>(
        () => (estudiantes.find((e) => e.estudiante_id === ver) ?? estudiantes.find((e) => !e.texto) ?? estudiantes[0])?.matricula_id ?? null,
    );
    const elegidoRef = useRef(elegido);
    elegidoRef.current = elegido;
    const [estado, setEstadoVisible] = useState<Estado>('guardado');
    const estadoRef = useRef<Estado>('guardado');
    const setEstado = (e: Estado) => {
        estadoRef.current = e;
        setEstadoVisible(e);
    };
    const [conflicto, setConflicto] = useState<Conflicto | null>(null);
    const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
    const [, setVersion] = useState(0); // vuelve a pintar al escribir (las hojas y el contador)
    const [recargar, setRecargar] = useState(0); // remonta el editor cuando el texto cambia desde afuera
    const temporizador = useRef<number | undefined>(undefined);
    // Todos los guardados van en fila: salen y terminan en orden, nunca dos a la vez.
    const fila = useRef<Promise<unknown>>(Promise.resolve());

    const estudiante = estudiantes.find((e) => e.matricula_id === elegido) ?? null;
    const escritos = estudiantes.filter((e) => (guardados[e.matricula_id]?.texto ?? '') !== '').length;
    const posicion = estudiante ? estudiantes.indexOf(estudiante) : -1;

    /**
     * Guarda el texto de un estudiante y dice si quedó guardado. `forzar`: sin comparar
     * versiones (después de un conflicto, «dejar el mío»). Lo que responde solo cambia
     * el estado en pantalla si ese estudiante sigue elegido.
     */
    const guardar = async (matricula: number, forzar = false): Promise<boolean> => {
        const texto = textos.current[matricula] ?? '';
        const antes = confirmado.current[matricula];
        const esElElegido = () => elegidoRef.current === matricula;
        if (!forzar && antes && antes.texto === texto) {
            if (esElElegido() && estadoRef.current !== 'conflicto') setEstado('guardado');
            return true;
        }
        if (esElElegido()) setEstado('guardando');
        const cuerpo = JSON.stringify(forzar ? { texto } : { texto, version: antes?.version ?? null });
        try {
            const r = await fetch(`/boletines/${matricula}/${periodoActual.id}`, {
                method: 'PUT',
                credentials: 'same-origin',
                // Sobrevive a cerrar la pestaña (hasta 64 KB).
                keepalive: cuerpo.length < 60_000,
                headers: cabeceras(),
                body: cuerpo,
            });
            if (r.status === 409) {
                const { conflicto: c } = (await r.json()) as { conflicto: Omit<Conflicto, 'matricula'> };
                if (esElElegido()) {
                    setConflicto({ ...c, matricula });
                    setEstado('conflicto');
                }
                return false;
            }
            if (r.status === 422) {
                const datos = (await r.json()) as { errors?: Record<string, string[]> };
                if (esElElegido()) {
                    setErrorGuardar(Object.values(datos.errors ?? {})[0]?.[0] ?? 'Revisa el texto.');
                    setEstado('error');
                }
                return false;
            }
            if (!r.ok) throw new Error(String(r.status));
            const datos = (await r.json()) as { version: string | null; por: string | null; actualizado_en: string | null };
            confirmado.current = { ...confirmado.current, [matricula]: { texto, version: datos.version, por: datos.por, en: datos.actualizado_en } };
            setGuardados(confirmado.current);
            if (esElElegido()) {
                setErrorGuardar(null);
                // Si se siguió escribiendo mientras guardaba, la vuelta siguiente ya está en la fila.
                setEstado(textos.current[matricula] === texto ? 'guardado' : 'pendiente');
            }
            return true;
        } catch {
            if (esElElegido()) {
                setErrorGuardar(null);
                setEstado('error');
            }
            return false;
        }
    };

    const enFila = (matricula: number, forzar = false): Promise<boolean> => {
        const turno = fila.current.then(() => guardar(matricula, forzar));
        fila.current = turno.catch(() => undefined);
        return turno;
    };

    /** Guarda ya lo pendiente y dice si todo quedó guardado (antes de cambiar de estudiante, de grupo o de imprimir). */
    const guardarAhora = async (): Promise<boolean> => {
        window.clearTimeout(temporizador.current);
        if (estadoRef.current === 'conflicto') return false;
        if (elegido === null) return true;
        return enFila(elegido);
    };
    const noSeGuardo = () =>
        sileo.warning({
            title: estadoRef.current === 'conflicto' ? 'Primero elige cuál dejar' : 'No se pudo guardar',
            description: estadoRef.current === 'conflicto' ? 'Este boletín tiene dos versiones.' : 'Seguimos aquí para no perder lo escrito.',
        });
    /** Hace `luego` solo si lo escrito quedó guardado. */
    const conTodoGuardado = async (luego: () => void) => ((await guardarAhora()) ? luego() : noSeGuardo());

    const alEscribir = (texto: string) => {
        if (elegido === null) return;
        textos.current[elegido] = texto;
        setVersion((v) => v + 1);
        if (estadoRef.current === 'conflicto') return;
        setEstado('pendiente');
        window.clearTimeout(temporizador.current);
        const matricula = elegido;
        temporizador.current = window.setTimeout(() => void enFila(matricula), 900);
    };

    // Con algo sin guardar: avisar antes de cerrar la pestaña y guardar al ocultarla.
    useEffect(() => {
        const antesDeSalir = (e: BeforeUnloadEvent) => {
            if (estadoRef.current !== 'guardado') e.preventDefault();
        };
        const alOcultar = () => {
            if (document.visibilityState === 'hidden' && estadoRef.current !== 'guardado' && elegidoRef.current !== null) {
                window.clearTimeout(temporizador.current);
                void enFila(elegidoRef.current);
            }
        };
        window.addEventListener('beforeunload', antesDeSalir);
        document.addEventListener('visibilitychange', alOcultar);
        // Al salir por el menú (visita de Inertia): preguntar si lo escrito no se pudo guardar.
        const quitar = router.on('before', (ev) => {
            const { method, only } = ev.detail.visit;
            if (method !== 'get' || only.length > 0) return; // envíos y recargas parciales (el pulso)
            const s = estadoRef.current;
            if ((s === 'error' || s === 'conflicto') && !window.confirm('Hay un boletín sin guardar. ¿Salir de todos modos?')) ev.preventDefault();
        });
        return () => {
            window.removeEventListener('beforeunload', antesDeSalir);
            document.removeEventListener('visibilitychange', alOcultar);
            quitar();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Si falló por la conexión, se reintenta solo.
    useEffect(() => {
        if (estado !== 'error' || errorGuardar || elegido === null) return;
        const t = window.setTimeout(() => void enFila(elegido), 5000);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estado, errorGuardar, elegido]);

    const ir = (matricula: number) => {
        if (matricula === elegido) return;
        void conTodoGuardado(() => {
            setConflicto(null);
            setErrorGuardar(null);
            setEstado('guardado');
            setElegido(matricula);
        });
    };
    const mover = (paso: number) => {
        const siguiente = estudiantes[posicion + paso];
        if (siguiente) ir(siguiente.matricula_id);
    };

    // Alt + ↑ ↓: el estudiante anterior o el siguiente, también mientras se escribe.
    useEffect(() => {
        const alPulsar = (e: KeyboardEvent) => {
            if (!e.altKey || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
            e.preventDefault();
            mover(e.key === 'ArrowDown' ? 1 : -1);
        };
        window.addEventListener('keydown', alPulsar);
        return () => window.removeEventListener('keydown', alPulsar);
    });

    /**
     * «Copiar a otros»: primero queda guardado este; después el mismo texto va a los
     * marcados (en la fila, como los guardados). A los que alguien cambió mientras
     * tanto no los pisa: quedan con lo suyo.
     */
    const [copiarAbierto, setCopiarAbierto] = useState(false);
    const copiar = async (para: number[]): Promise<boolean> => {
        if (elegido === null) return false;
        if (!(await guardarAhora())) {
            noSeGuardo();
            return false;
        }
        const texto = textos.current[elegido] ?? '';
        const turno = fila.current.then(async () => {
            const r = await fetch('/boletines/copiar', {
                method: 'POST',
                credentials: 'same-origin',
                headers: cabeceras(),
                body: JSON.stringify({
                    periodo: periodoActual.id,
                    texto,
                    para: para.map((m) => ({ matricula: m, version: confirmado.current[m]?.version ?? null })),
                }),
            });
            if (!r.ok) throw new Error(String(r.status));
            return (await r.json()) as {
                copiados: Record<string, { version: string; actualizado_en: string; por: string }>;
                omitidos: Record<string, Guardado>;
            };
        });
        fila.current = turno.catch(() => undefined);
        try {
            const { copiados, omitidos } = await turno;
            const nuevos = { ...confirmado.current };
            for (const [m, d] of Object.entries(copiados)) {
                nuevos[Number(m)] = { texto, version: d.version, por: d.por, en: d.actualizado_en };
                textos.current[Number(m)] = texto;
            }
            for (const [m, d] of Object.entries(omitidos)) {
                nuevos[Number(m)] = d;
                textos.current[Number(m)] = d.texto;
            }
            confirmado.current = nuevos;
            setGuardados(nuevos);
            const n = Object.keys(copiados).length;
            const k = Object.keys(omitidos).length;
            const saltados = k === 1 ? '1 no se copió' : `${k} no se copiaron`;
            if (n === 0) sileo.warning({ title: 'No se copió', description: 'Alguien los cambió mientras tanto: quedaron con lo suyo.' });
            else
                sileo.success({
                    title: n === 1 ? 'Copiado a 1 estudiante' : `Copiado a ${n} estudiantes`,
                    description: k ? `${saltados}: alguien lo cambió mientras tanto.` : 'Puedes ajustar cada uno cuando quieras.',
                });
            return true;
        } catch {
            sileo.error({ title: 'No se pudo copiar', description: 'Revisa la conexión e intenta de nuevo.' });
            return false;
        }
    };

    const imprimir = (soloEste: boolean) =>
        void conTodoGuardado(() => {
            const consulta = new URLSearchParams({ grupo: String(grupo.id), periodo: String(periodoActual.id) });
            if (soloEste && estudiante) consulta.set('estudiante', String(estudiante.estudiante_id));
            router.visit(`/boletines/imprimir?${consulta}`);
        });

    const resolver = (usar: 'suyo' | 'mio') => {
        if (!conflicto) return;
        const m = conflicto.matricula;
        setConflicto(null);
        if (m !== elegido) return;
        if (usar === 'suyo') {
            window.clearTimeout(temporizador.current);
            textos.current[m] = conflicto.texto;
            confirmado.current = {
                ...confirmado.current,
                [m]: { texto: conflicto.texto, version: conflicto.version, por: conflicto.por, en: conflicto.en },
            };
            setGuardados(confirmado.current);
            setRecargar((n) => n + 1);
            setEstado('guardado');
        } else {
            setEstado('pendiente');
            void enFila(m, true);
        }
    };
    // «Otra persona»; si fue la misma, otra pestaña o una página vieja (volver con «Atrás»).
    const quien = conflicto?.por && conflicto.por !== auth.user.name ? conflicto.por : null;

    const texto = elegido !== null ? (textos.current[elegido] ?? '') : '';
    const guardado = elegido !== null ? guardados[elegido] : undefined;
    const faltanFirmas = !grupo.director || !grupo.coordinador;

    return (
        <PanelLayout titulo={`Boletines · ${grupo.codigo}`} completa>
            <div className="flex flex-col gap-5 lg:h-full lg:min-h-0 lg:flex-row">
                {/* ------------------------------------------------ estudiantes */}
                <aside className="flex shrink-0 flex-col rounded-[28px] bg-[#F2F5FA] lg:min-h-0 lg:w-[310px]">
                    <div className="space-y-3 p-4 pb-3">
                        <div>
                            <h1 className="text-[20px] font-semibold tracking-[-0.015em]">Boletines</h1>
                            <p className="text-[13px] text-[#56627F]">Transición · {anio}</p>
                        </div>
                        <Desplegable
                            etiqueta="Grupo"
                            valor={grupo.id}
                            opciones={grupos.map((g) => ({
                                valor: g.id,
                                etiqueta: `${g.codigo} · ${g.sede}`,
                                detalle: `${g.activos} estudiantes · ${g.jornada}`,
                            }))}
                            onCambio={(id) => void conTodoGuardado(() => router.get('/boletines', { grupo: id, periodo: periodoActual.id }))}
                            claseBoton={cn(claseLista, 'flex items-center bg-white')}
                        />
                        <div role="radiogroup" aria-label="Periodo" className="flex rounded-full bg-white p-1 ring-1 ring-[#E3E9F6]">
                            {periodos.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={p.id === periodoActual.id}
                                    onClick={() =>
                                        p.id !== periodoActual.id &&
                                        void conTodoGuardado(() => router.get('/boletines', { grupo: grupo.id, periodo: p.id }))
                                    }
                                    className={cn(
                                        'h-8 flex-1 cursor-pointer rounded-full px-2 text-[13px] font-semibold whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                        p.id === periodoActual.id ? 'bg-[#1E3A7B] text-white' : 'text-[#56627F] hover:text-[#16223F]',
                                    )}
                                >
                                    {tituloPeriodo(p).replace(/ \d+%$/, '')}
                                </button>
                            ))}
                        </div>
                        <div>
                            <p className="flex items-baseline justify-between text-[13px] text-[#56627F]">
                                <span>
                                    <b className="font-semibold text-[#16223F] tabular-nums">{escritos}</b> de {estudiantes.length} escritos
                                </span>
                                {escritos === estudiantes.length && estudiantes.length > 0 && (
                                    <span className="font-medium text-[#1C6B4A]">¡Completo!</span>
                                )}
                            </p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#DCE3F2]">
                                <div
                                    className="h-full rounded-full bg-[#3BA67A] transition-[width] duration-300"
                                    style={{ width: `${estudiantes.length ? (escritos / estudiantes.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <ul aria-label="Estudiantes del grupo" className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2 [scrollbar-width:thin] lg:min-h-0">
                        {estudiantes.length === 0 && (
                            <li className="px-3 py-6 text-center text-[14px] text-[#56627F]">Este grupo no tiene estudiantes activos.</li>
                        )}
                        {estudiantes.map((e) => {
                            const lleno = (guardados[e.matricula_id]?.texto ?? '') !== '';
                            const activo = e.matricula_id === elegido;
                            return (
                                <li key={e.matricula_id}>
                                    <button
                                        type="button"
                                        onClick={() => ir(e.matricula_id)}
                                        aria-current={activo ? 'true' : undefined}
                                        className={cn(
                                            // relative: el «, sin escribir» oculto queda dentro del botón (si no, alarga la página).
                                            'relative flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-[14px] transition focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none',
                                            activo
                                                ? 'bg-white font-semibold text-[#1E3A7B] shadow-[0_1px_2px_rgba(22,34,63,0.08)]'
                                                : 'text-[#3E4A68] hover:bg-white/60',
                                        )}
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'flex size-[18px] shrink-0 items-center justify-center rounded-full',
                                                lleno ? 'bg-[#3BA67A] text-white' : 'ring-[1.5px] ring-[#B7C6EA] ring-inset',
                                            )}
                                        >
                                            {lleno && <Check className="size-3" strokeWidth={3} />}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">{e.nombre}</span>
                                        <span className="sr-only">{lleno ? ', escrito' : ', sin escribir'}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="space-y-2 border-t border-[#E3E9F6] p-3">
                        {faltanFirmas && (
                            <p className="flex items-start gap-2 rounded-[14px] bg-[#FFF7E8] px-3 py-2 text-[13px] leading-snug text-[#6B4A0E]">
                                <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#B7862C]" />
                                <span>
                                    Faltan{' '}
                                    {[!grupo.director && 'el director(a) del grupo', !grupo.coordinador && 'el coordinador(a)']
                                        .filter(Boolean)
                                        .join(' y ')}
                                    .{!puedeConfigurar && ' Pídele a coordinación que los agregue.'}
                                </span>
                            </p>
                        )}
                        {puedeConfigurar && <BotonFirmas grupo={grupo} usuarios={usuarios} puedeCrear={puedeCrearFirmantes} />}
                        <button type="button" onClick={() => imprimir(false)} disabled={escritos === 0} className={cn(botonPrimario, 'w-full')}>
                            <Printer className="size-[18px]" />
                            Imprimir todos ({escritos})
                        </button>
                    </div>
                </aside>

                {/* ------------------------------------------------ la hoja */}
                <section className="flex min-w-0 flex-1 flex-col lg:min-h-0">
                    {estudiante ? (
                        <>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => mover(-1)}
                                        disabled={posicion <= 0}
                                        title="Anterior (Alt + ↑)"
                                        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#56627F] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] disabled:cursor-default disabled:opacity-40"
                                    >
                                        <ChevronUp className="size-4" />
                                        <span className="sr-only">Estudiante anterior</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => mover(1)}
                                        disabled={posicion >= estudiantes.length - 1}
                                        title="Siguiente (Alt + ↓)"
                                        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#56627F] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] disabled:cursor-default disabled:opacity-40"
                                    >
                                        <ChevronDown className="size-4" />
                                        <span className="sr-only">Estudiante siguiente</span>
                                    </button>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[16px] font-semibold">{estudiante.nombre}</p>
                                    <EstadoGuardado estado={estado} guardado={guardado} error={errorGuardar} />
                                </div>
                                <AvisoHoja nombre={estudiante.nombres_apellidos} texto={texto} maximo={maximo} />
                                <button
                                    type="button"
                                    onClick={() => setCopiarAbierto(true)}
                                    disabled={!texto || estudiantes.length < 2}
                                    title={texto ? 'Poner este mismo texto en otros estudiantes del grupo' : 'Primero escribe el texto'}
                                    className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <Copy className="size-4" />
                                    Copiar a otros
                                </button>
                                <button
                                    type="button"
                                    onClick={() => imprimir(true)}
                                    className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none"
                                >
                                    <Printer className="size-4" />
                                    Imprimir este
                                </button>
                            </div>

                            {conflicto && (
                                <div
                                    role="alert"
                                    className="mb-3 flex flex-wrap items-center gap-3 rounded-[16px] bg-[#FFF7E8] px-4 py-3 text-[14px] text-[#6B4A0E]"
                                >
                                    <CircleAlert className="size-[18px] shrink-0 text-[#B7862C]" />
                                    <p className="min-w-0 flex-1">
                                        {quien ? (
                                            <>
                                                <b className="font-semibold">{quien}</b> cambió este boletín mientras lo escribías.
                                            </>
                                        ) : (
                                            'Este boletín se guardó desde otra ventana después de que abriste esta.'
                                        )}{' '}
                                        ¿Cuál dejamos?
                                    </p>
                                    <button type="button" onClick={() => resolver('suyo')} className={cn(botonSecundario, 'h-9 bg-white')}>
                                        {quien ? `El de ${quien.split(' ')[0]}` : 'El guardado'}
                                    </button>
                                    <button type="button" onClick={() => resolver('mio')} className={cn(botonPrimario, 'h-9')}>
                                        {quien ? 'El mío' : 'El de esta ventana'}
                                    </button>
                                </div>
                            )}

                            <Mesa>
                                <HojaEditable
                                    key={`${estudiante.matricula_id}-${recargar}`}
                                    grupo={grupo}
                                    estudiante={estudiante}
                                    periodo={periodoActual.etiqueta}
                                    texto={texto}
                                    onCambio={alEscribir}
                                />
                            </Mesa>
                        </>
                    ) : (
                        <p className="mt-16 text-center text-[15px] text-[#56627F]">Elige un estudiante para escribir su boletín.</p>
                    )}
                </section>
            </div>

            <Dialog open={copiarAbierto} onOpenChange={setCopiarAbierto}>
                <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-[520px] flex-col gap-0 overflow-hidden rounded-[22px] border-[#E3E9F6] p-0 font-sans text-[#16223F] sm:rounded-[22px]">
                    {copiarAbierto && estudiante && (
                        <DialogoCopiar
                            desde={estudiante}
                            estudiantes={estudiantes}
                            guardados={guardados}
                            texto={texto}
                            periodo={tituloPeriodo(periodoActual)
                                .replace(/ \d+%$/, '')
                                .toLowerCase()}
                            onCopiar={copiar}
                            onListo={() => setCopiarAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </PanelLayout>
    );
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
/** Si el texto nombra a alguien (por ejemplo «Ian se destaca…»): al copiarlo hay que cambiarlo. */
const nombra = (texto: string, nombre: string) =>
    /^\p{L}{2,}$/u.test(nombre) && new RegExp(`(^|[^\\p{L}])${sinTildes(nombre)}($|[^\\p{L}])`, 'u').test(sinTildes(texto));

/** «Copiar a otros»: a quiénes del grupo poner el mismo texto. De entrada, a los que aún no tienen. */
function DialogoCopiar({
    desde,
    estudiantes,
    guardados,
    texto,
    periodo,
    onCopiar,
    onListo,
}: {
    desde: EstudianteBoletin;
    estudiantes: EstudianteBoletin[];
    guardados: Record<number, Guardado>;
    texto: string;
    periodo: string;
    onCopiar: (para: number[]) => Promise<boolean>;
    onListo: () => void;
}) {
    const otros = estudiantes.filter((e) => e.matricula_id !== desde.matricula_id);
    const tiene = (e: EstudianteBoletin) => (guardados[e.matricula_id]?.texto ?? '') !== '';
    const vacios = otros.filter((e) => !tiene(e)).map((e) => e.matricula_id);
    const [marcados, setMarcados] = useState(() => new Set(vacios));
    const [ocupado, setOcupado] = useState(false);
    const reemplaza = otros.filter((e) => marcados.has(e.matricula_id) && tiene(e)).length;
    // Nombres del grupo que aparecen en el texto (el de quien se copia u otro que quedó de antes).
    const nombrados = [...new Set([desde, ...otros].map((e) => e.nombres_apellidos.split(' ')[0] ?? ''))]
        .filter((n) => nombra(texto, n))
        .map(aTitulo);

    const alternar = (id: number, si: boolean) =>
        setMarcados((antes) => {
            const s = new Set(antes);
            if (si) s.add(id);
            else s.delete(id);
            return s;
        });
    const enviar = async () => {
        setOcupado(true);
        const listo = await onCopiar(otros.filter((e) => marcados.has(e.matricula_id)).map((e) => e.matricula_id));
        setOcupado(false);
        if (listo) onListo();
    };
    const atajo =
        'h-8 cursor-pointer rounded-full px-3 text-[13px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none';

    return (
        <>
            <DialogHeader className="px-6 pt-6 pr-14 pb-3">
                <DialogTitle className="text-xl font-semibold">Copiar a otros estudiantes</DialogTitle>
                <DialogDescription className="text-[14px] leading-snug text-[#56627F]">
                    El texto de <b className="font-semibold text-[#16223F]">{desde.nombre}</b> ({periodo}) queda igual en los que marques. Después
                    puedes ajustar cada uno.
                </DialogDescription>
            </DialogHeader>

            {nombrados.length > 0 && (
                <p className="mx-6 mb-3 flex items-start gap-2 rounded-[14px] bg-[#FFF7E8] px-3 py-2 text-[13px] leading-snug text-[#6B4A0E]">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#B7862C]" />
                    <span>
                        El texto nombra a{' '}
                        <b className="font-semibold">
                            {nombrados.length > 1 ? `${nombrados.slice(0, -1).join(', ')} y ${nombrados.at(-1)}` : nombrados[0]}
                        </b>
                        : después de copiarlo, cambia el nombre en cada boletín.
                    </span>
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2 px-6 pb-2">
                <span className="text-[13px] text-[#56627F]">Marcar:</span>
                <button type="button" onClick={() => setMarcados(new Set(vacios))} className={atajo}>
                    Sin texto ({vacios.length})
                </button>
                <button type="button" onClick={() => setMarcados(new Set(otros.map((e) => e.matricula_id)))} className={atajo}>
                    Todos ({otros.length})
                </button>
                <button type="button" onClick={() => setMarcados(new Set())} className={atajo}>
                    Ninguno
                </button>
            </div>

            <ul aria-label="Estudiantes" className="min-h-0 flex-1 overflow-y-auto border-y border-[#EEF2F9] px-3 py-2 [scrollbar-width:thin]">
                {otros.map((e) => {
                    const marcado = marcados.has(e.matricula_id);
                    const lleno = tiene(e);
                    return (
                        <li key={e.matricula_id}>
                            <label className="relative flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2 transition hover:bg-[#F5F8FF]">
                                <input
                                    type="checkbox"
                                    checked={marcado}
                                    onChange={(ev) => alternar(e.matricula_id, ev.target.checked)}
                                    className="peer sr-only"
                                />
                                <span
                                    aria-hidden
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-[6px] transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE5F8]',
                                        marcado ? 'bg-[#1E3A7B] text-white' : 'border-[1.5px] border-[#B7C6EA] bg-white',
                                    )}
                                >
                                    {marcado && <Check className="size-3" strokeWidth={3} />}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[14.5px]">{e.nombre}</span>
                                <span
                                    className={cn(
                                        'shrink-0 text-[12.5px]',
                                        lleno && marcado ? 'font-semibold text-[#8A5A0B]' : lleno ? 'text-[#56627F]' : 'text-[#8C97B3]',
                                    )}
                                >
                                    {lleno ? (marcado ? 'Se reemplaza' : 'Ya tiene texto') : 'Sin texto'}
                                </span>
                            </label>
                        </li>
                    );
                })}
            </ul>

            <div className="space-y-3 px-6 py-4">
                {reemplaza > 0 && (
                    <p className="flex items-center gap-2 text-[13px] leading-snug text-[#8A5A0B]" aria-live="polite">
                        <CircleAlert className="size-4 shrink-0 text-[#B7862C]" />
                        {reemplaza === 1 ? 'Se reemplaza lo que ya tenía 1 estudiante.' : `Se reemplaza lo que ya tenían ${reemplaza} estudiantes.`}
                    </p>
                )}
                <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={onListo} className={botonSecundario}>
                        Cancelar
                    </button>
                    <button type="button" onClick={() => void enviar()} disabled={ocupado || marcados.size === 0} className={botonPrimario}>
                        {ocupado ? <LoaderCircle className="size-4 animate-spin" /> : <Copy className="size-4" />}
                        {marcados.size === 0 ? 'Copiar' : marcados.size === 1 ? 'Copiar a 1' : `Copiar a ${marcados.size}`}
                    </button>
                </div>
            </div>
        </>
    );
}

function EstadoGuardado({ estado, guardado, error }: { estado: Estado; guardado?: Guardado; error: string | null }) {
    const clase = 'flex items-center gap-1.5 text-[13px]';
    if (estado === 'guardando' || estado === 'pendiente')
        return (
            <p className={cn(clase, 'text-[#56627F]')} aria-live="polite">
                <LoaderCircle className="size-3.5 animate-spin" />
                Guardando…
            </p>
        );
    if (estado === 'error')
        return (
            <p className={cn(clase, 'text-[#B42318]')} aria-live="polite">
                <CloudOff className="size-3.5" />
                {error ?? 'No se pudo guardar: se vuelve a intentar solo.'}
            </p>
        );
    if (estado === 'conflicto')
        return (
            <p className={cn(clase, 'text-[#8A5A0B]')} aria-live="polite">
                Sin guardar: elige cuál dejar.
            </p>
        );
    return (
        <p className={cn(clase, 'text-[#56627F]')} aria-live="polite">
            {guardado?.texto ? (
                <>
                    <Check className="size-3.5 text-[#1C6B4A]" strokeWidth={2.5} />
                    Guardado{guardado.por ? ` por ${guardado.por}` : ''}
                    {guardado.en ? ` · ${hace(guardado.en).toLowerCase()}` : ''}
                </>
            ) : (
                <>
                    <PenLine className="size-3.5" />
                    Escribe sobre la hoja: se guarda solo.
                </>
            )}
        </p>
    );
}

/** Si el texto obligó a achicar la letra o a usar más de una hoja (o se pasa del largo permitido). */
function AvisoHoja({ nombre, texto, maximo }: { nombre: string; texto: string; maximo: number }) {
    const { tamano, paginas } = useMemo(() => paginar(nombre, texto), [nombre, texto]);
    const largo = texto.length > maximo;
    if (!largo && paginas.length === 1 && tamano === TAMANOS[0]) return null;
    return (
        <p
            aria-live="polite"
            className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium',
                largo ? 'bg-[#FDECEC] text-[#8E2323]' : paginas.length > 1 ? 'bg-[#FFF7E8] text-[#6B4A0E]' : 'bg-[#EEF2FB] text-[#3E4A68]',
            )}
        >
            {largo
                ? `Muy largo: ${texto.length.toLocaleString('es-CO')} de ${maximo.toLocaleString('es-CO')} caracteres`
                : paginas.length > 1
                  ? `Ocupa ${paginas.length} hojas al imprimir`
                  : `Letra a ${String(tamano).replace('.', ',')} pt para que quepa en una hoja`}
        </p>
    );
}

/** El fondo gris donde va la hoja; la achica si la pantalla es angosta. */
function Mesa({ children }: { children: ReactNode }) {
    const caja = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    useLayoutEffect(() => {
        const el = caja.current;
        if (!el) return;
        const ajustar = () => setZoom(Math.min(1, (el.clientWidth - 32) / 816));
        ajustar();
        const ro = new ResizeObserver(ajustar);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return (
        <div ref={caja} className="flex-1 overflow-auto rounded-[28px] bg-[#DDE3EE] px-4 py-6 lg:min-h-0">
            <div className="mx-auto w-fit" style={{ zoom }}>
                {children}
            </div>
        </div>
    );
}

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Lo escrito en el campo, como párrafos (cada bloque o salto de línea empieza uno). */
function leer(div: HTMLElement): string {
    const partes: string[] = [];
    let suelto = '';
    div.childNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) suelto += n.textContent ?? '';
        else if (n.nodeName === 'BR') {
            partes.push(suelto);
            suelto = '';
        } else {
            if (suelto) partes.push(suelto);
            suelto = '';
            partes.push((n as HTMLElement).innerText);
        }
    });
    if (suelto) partes.push(suelto);
    return partes
        .join('\n')
        .split('\n')
        .map((p) => p.replace(/[\s\u00A0]+/g, ' ').trim())
        .filter(Boolean)
        .join('\n');
}

/**
 * La hoja con el texto editable en su lugar: la misma letra, el mismo ancho y el
 * mismo interlineado que al imprimir. Si el texto crece, la letra se achica como
 * en la impresión; si no cabe en una hoja, la hoja se alarga y lo avisa.
 */
function HojaEditable({
    grupo,
    estudiante,
    periodo,
    texto,
    onCambio,
}: {
    grupo: GrupoBoletin;
    estudiante: EstudianteBoletin;
    periodo: string;
    texto: string;
    onCambio: (texto: string) => void;
}) {
    const campo = useRef<HTMLDivElement>(null);
    const [vacio, setVacio] = useState(!texto);
    const { tamano, paginas } = useMemo(() => paginar(estudiante.nombres_apellidos, texto), [estudiante.nombres_apellidos, texto]);
    const varias = paginas.length > 1;
    const letra = varias ? TAMANOS[0] : tamano;

    // El texto inicial va una sola vez: después el campo es del usuario (React no lo vuelve a pintar).
    useLayoutEffect(() => {
        const el = campo.current;
        if (!el) return;
        const ps = parrafos(texto);
        el.innerHTML = ps.length ? ps.map((p) => `<p>${escapar(p)}</p>`).join('') : '<p><br></p>';
        // Formatos (negrita, cursiva) y soltar cosas arrastradas no van: la hoja es texto plano.
        const antes = (e: InputEvent) => {
            if (e.inputType.startsWith('format') || e.inputType === 'insertFromDrop') e.preventDefault();
        };
        el.addEventListener('beforeinput', antes);
        return () => el.removeEventListener('beforeinput', antes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cambio = () => {
        const el = campo.current;
        if (!el) return;
        // Si se borró todo, vuelve a quedar un párrafo vacío donde escribir.
        if (!el.firstChild) el.innerHTML = '<p><br></p>';
        const nuevo = leer(el);
        setVacio(!nuevo);
        onCambio(nuevo);
    };

    return (
        <HojaBoletin
            grupo={grupo}
            estudiante={estudiante}
            periodo={periodo}
            pagina={{ bloques: [], primera: true, firmas: true }}
            tamano={letra}
            alta={varias}
        >
            <div
                style={{
                    width: `${ANCHO}pt`,
                    letterSpacing: ESPACIADO,
                    fontFamily: 'Arial, "Liberation Sans", Arimo, Helvetica, sans-serif',
                    fontSize: `${letra}pt`,
                    lineHeight: 11.6 / 10.2,
                    textAlign: 'justify',
                }}
            >
                <p style={{ fontWeight: 700, marginBottom: '1em' }}>{estudiante.nombres_apellidos}</p>
                <div className="relative">
                    {vacio && (
                        <p aria-hidden className="pointer-events-none absolute inset-x-0 top-0 text-[#8C97B3] italic">
                            Escribe aquí la valoración de {estudiante.nombres_apellidos.split(' ')[0]}…
                        </p>
                    )}
                    <div
                        ref={campo}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline
                        aria-label={`Valoración de ${estudiante.nombre}`}
                        spellCheck
                        lang="es"
                        onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
                        onInput={cambio}
                        onPaste={(e) => {
                            // Pegar siempre como texto, y si viene de un PDF, con los párrafos rearmados.
                            e.preventDefault();
                            const ps = desenvolver(e.clipboardData.getData('text/plain'), estudiante.nombres_apellidos);
                            if (!ps.length) return;
                            if (ps.length === 1) document.execCommand('insertText', false, ps[0]);
                            else document.execCommand('insertHTML', false, ps.map((p) => `<p>${escapar(p)}</p>`).join(''));
                            cambio();
                        }}
                        onDrop={(e) => e.preventDefault()}
                        className="min-h-[3em] rounded-[2px] outline-none focus:bg-[#F5F8FF] focus:shadow-[0_0_0_4px_#F5F8FF] [&>*]:mb-[1em] [&>*:last-child]:mb-[1em]"
                    />
                </div>
            </div>
        </HojaBoletin>
    );
}

/** «Firmas y jornada»: director(a) del grupo, coordinador(a) de la sede y cómo se escribe la jornada. */
function BotonFirmas({ grupo, usuarios, puedeCrear }: { grupo: GrupoBoletin; usuarios: Usuario[]; puedeCrear: boolean }) {
    const [abierto, setAbierto] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setAbierto(true)} className={cn(botonSecundario, 'h-10 w-full ring-1 ring-[#D3DDF3]')}>
                <UserPen className="size-4" />
                Firmas y jornada
            </button>
            <Dialog open={abierto} onOpenChange={setAbierto}>
                <DialogContent className="flex max-w-[520px] flex-col gap-0 overflow-hidden rounded-[22px] border-[#E3E9F6] p-0 font-sans text-[#16223F] sm:rounded-[22px]">
                    {abierto && <FormularioFirmas grupo={grupo} usuarios={usuarios} puedeCrear={puedeCrear} onListo={() => setAbierto(false)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

/** El director(a) que ya estaba sin usuario (no es un id de usuario). */
const SIN_USUARIO = -1;
/** «CAMILA RAMÍREZ» → «Camila Ramírez». */
const aTitulo = (s: string) => s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

const ROLES: Record<string, string> = { docente: 'Docente', coordinacion: 'Coordinación', secretaria: 'Secretaría', administrador: 'Administrador' };

function FormularioFirmas({
    grupo,
    usuarios,
    puedeCrear,
    onListo,
}: {
    grupo: GrupoBoletin;
    usuarios: Usuario[];
    puedeCrear: boolean;
    onListo: () => void;
}) {
    // Un director(a) que ya estaba como docente pero sin usuario: se muestra (SIN_USUARIO) y se deja igual al guardar.
    const sinUsuario = grupo.director && grupo.director_id === null ? aTitulo(grupo.director) : null;
    const form = useForm<{ director_id: number | null; coordinador_id: number | null; jornada_boletin: string }>({
        director_id: grupo.director_id ?? (sinUsuario ? SIN_USUARIO : null),
        coordinador_id: grupo.coordinador_id,
        jornada_boletin: grupo.jornada_boletin ?? '',
    });
    // Los que se crean aquí mismo entran a la lista sin recargar la página.
    const [nuevos, setNuevos] = useState<Usuario[]>([]);
    const opciones = [
        { valor: 0, etiqueta: 'Nadie todavía' },
        ...[...usuarios, ...nuevos.filter((n) => !usuarios.some((u) => u.id === n.id))].map((u) => ({
            valor: u.id,
            etiqueta: u.name,
            detalle: u.rol ? (ROLES[u.rol] ?? u.rol) : undefined,
        })),
    ];
    const opcionesDirector = sinUsuario
        ? [opciones[0], { valor: SIN_USUARIO, etiqueta: sinUsuario, detalle: 'Sin usuario' }, ...opciones.slice(1)]
        : opciones;
    const creado = (campo: 'director_id' | 'coordinador_id') => (u: Usuario) => {
        setNuevos((l) => [...l, u]);
        form.setData(campo, u.id);
    };

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        form.transform(({ director_id, ...d }) => ({
            ...d,
            // Sin director_id: el que ya estaba (sin usuario) se queda.
            ...(director_id === SIN_USUARIO ? {} : { director_id: director_id || null }),
            coordinador_id: d.coordinador_id || null,
        }));
        form.put(`/boletines/grupos/${grupo.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                sileo.success({ title: 'Firmas y jornada guardadas', description: `Salen en todos los boletines del grupo ${grupo.codigo}.` });
                onListo();
            },
        });
    };

    return (
        <form onSubmit={enviar}>
            <DialogHeader className="px-6 pt-6 pr-14 pb-4">
                <DialogTitle className="text-xl font-semibold">Firmas y jornada · {grupo.codigo}</DialogTitle>
                <DialogDescription className="text-[14px] leading-snug text-[#56627F]">
                    Salen en todos los boletines del grupo, tal como están escritos aquí.
                    {!puedeCrear && ' Si alguien no está en la lista, pídele al administrador que lo cree en Usuarios.'}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 pb-5">
                <div className="space-y-2">
                    <Campo id="director" etiqueta="Director(a) de grupo" error={form.errors.director_id}>
                        <Desplegable
                            id="director"
                            etiqueta="Director(a) de grupo"
                            valor={form.data.director_id ?? 0}
                            opciones={opcionesDirector}
                            onCambio={(v) => form.setData('director_id', v || null)}
                            claseBoton={cn(claseLista, 'flex items-center')}
                        />
                    </Campo>
                    {puedeCrear && <CrearFirmante grupo={grupo} para="director" sugerido={sinUsuario} onCreado={creado('director_id')} />}
                </div>
                <div className="space-y-2">
                    <Campo
                        id="coordinador"
                        etiqueta="Rector(a) o coordinador(a)"
                        ayuda={`Es el mismo para todos los grupos de la sede ${aTitulo(grupo.sede)}.`}
                        error={form.errors.coordinador_id}
                    >
                        <Desplegable
                            id="coordinador"
                            etiqueta="Rector(a) o coordinador(a)"
                            valor={form.data.coordinador_id ?? 0}
                            opciones={opciones}
                            onCambio={(v) => form.setData('coordinador_id', v || null)}
                            claseBoton={cn(claseLista, 'flex items-center')}
                        />
                    </Campo>
                    {puedeCrear && <CrearFirmante grupo={grupo} para="coordinador" onCreado={creado('coordinador_id')} />}
                </div>
                <Campo
                    id="jornada"
                    etiqueta="Jornada en el boletín"
                    ayuda={`Si queda vacío sale «${grupo.jornada_grupo.toUpperCase()}».`}
                    error={form.errors.jornada_boletin}
                    opcional
                >
                    <input
                        id="jornada"
                        value={form.data.jornada_boletin}
                        onChange={(e) => form.setData('jornada_boletin', e.target.value)}
                        placeholder="Ej. UNICA DE 6:45AM A 12:00PM"
                        maxLength={60}
                        className={claseCampo}
                    />
                </Campo>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#EEF2F9] px-6 py-4">
                <button type="button" onClick={onListo} className={botonSecundario}>
                    Cancelar
                </button>
                <button type="submit" disabled={form.processing} className={botonPrimario}>
                    {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                    Guardar
                </button>
            </div>
        </form>
    );
}

/**
 * Crear ahí mismo a quien firma y no está en la lista: con el nombre tal como debe
 * salir en el boletín. Queda como usuario de la sede, sin clave conocida.
 */
function CrearFirmante({
    grupo,
    para,
    sugerido = null,
    onCreado,
}: {
    grupo: GrupoBoletin;
    para: 'director' | 'coordinador';
    /** El director(a) que está sin usuario: el nombre ya escrito. */
    sugerido?: string | null;
    onCreado: (u: Usuario) => void;
}) {
    const [abierto, setAbierto] = useState(false);
    const [nombre, setNombre] = useState(sugerido ?? '');
    const [error, setError] = useState<string | null>(null);
    const [ocupado, setOcupado] = useState(false);
    const [listo, setListo] = useState<string | null>(null);
    const id = `nuevo-${para}`;

    const crear = async () => {
        if (ocupado || !nombre.trim()) return;
        setOcupado(true);
        setError(null);
        try {
            const r = await fetch(`/boletines/grupos/${grupo.id}/firmantes`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: cabeceras(),
                body: JSON.stringify({ nombre, para }),
            });
            if (r.status === 422) {
                const datos = (await r.json()) as { errors?: Record<string, string[]> };
                setError(Object.values(datos.errors ?? {})[0]?.[0] ?? 'Revisa el nombre.');
                return;
            }
            if (!r.ok) throw new Error(String(r.status));
            const u = (await r.json()) as Usuario & { usuario: string };
            onCreado(u);
            setListo(u.usuario);
            setNombre('');
            setAbierto(false);
            // El foco vuelve a la lista, ya con la persona elegida.
            requestAnimationFrame(() => document.getElementById(para)?.focus());
        } catch {
            setError('No se pudo crear. Revisa la conexión e intenta de nuevo.');
        } finally {
            setOcupado(false);
        }
    };

    if (!abierto)
        return (
            <div className="space-y-1.5">
                {listo && (
                    <p className="flex items-start gap-1.5 text-[13px] leading-snug text-[#1C6B4A]" aria-live="polite">
                        <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
                        <span>Listo: su usuario es «{listo}». Para que entre a SIEAGE, ponle clave en Usuarios.</span>
                    </p>
                )}
                <button
                    type="button"
                    onClick={() => {
                        setAbierto(true);
                        setListo(null);
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full text-[13px] font-semibold text-[#1E3A7B] hover:underline focus-visible:ring-2 focus-visible:ring-[#6E8BD6] focus-visible:outline-none"
                >
                    <UserPlus className="size-4" />
                    {sugerido && !listo ? `Crear el usuario de ${sugerido}` : '¿No está en la lista? Crearlo aquí'}
                </button>
            </div>
        );

    return (
        <div className="space-y-2 rounded-[16px] bg-[#F5F8FF] p-3 ring-1 ring-[#E3E9F6]">
            <label htmlFor={id} className="block text-[13px] font-medium text-[#3E4A68]">
                Nombre completo, tal como debe salir en el boletín
            </label>
            <div className="flex gap-2">
                <input
                    id={id}
                    autoFocus
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => {
                        // Enter crea a la persona (no guarda todo el formulario).
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            void crear();
                        }
                    }}
                    placeholder="Nombres y apellidos"
                    maxLength={120}
                    autoComplete="off"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={`${id}-nota`}
                    className={claseCampo}
                />
                <button
                    type="button"
                    onClick={() => void crear()}
                    disabled={ocupado || !nombre.trim()}
                    className={cn(botonPrimario, 'shrink-0 px-4')}
                >
                    {ocupado && <LoaderCircle className="size-4 animate-spin" />}
                    Crear
                </button>
            </div>
            <p id={`${id}-nota`} className={cn('text-[13px] leading-snug', error ? 'text-[#B42318]' : 'text-[#56627F]')}>
                {error ??
                    `Queda como usuario ${para === 'director' ? 'docente' : 'de coordinación'} de la sede ${aTitulo(grupo.sede)}, sin clave: si va a entrar a SIEAGE, se la pones en Usuarios.`}
            </p>
            <button
                type="button"
                onClick={() => {
                    setAbierto(false);
                    setError(null);
                }}
                className="cursor-pointer text-[13px] font-medium text-[#56627F] hover:text-[#16223F]"
            >
                Cancelar
            </button>
        </div>
    );
}
