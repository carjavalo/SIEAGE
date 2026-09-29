import { PuntoSede, sedeInfo } from '@/components/estudiantes/etiquetas';
import { botonPrimario, botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Grado, type Grupo } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router } from '@inertiajs/react';
import { LoaderCircle, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';

/** Mismo permiso que deshabilitar: administración, coordinación y secretaría. */
export const puedeEditarCupos = (auth: SharedData['auth']) => !!(auth as { puedeDeshabilitar?: boolean }).puedeDeshabilitar;

const campo =
    'h-10 w-20 rounded-[10px] border-[1.5px] border-[#D3DDF3] bg-white px-3 text-center text-[15px] font-semibold text-[#16223F] tabular-nums outline-none transition focus:border-[#6E8BD6] focus:ring-4 focus:ring-[#DCE5F8] aria-invalid:border-[#E0897D]';

/**
 * Botón "Cupos" de la lista: abre la tabla de grupos del grado a la vista, cada
 * uno con su cupo editable, y un atajo para poner el mismo a todos.
 */
export function BotonCupos({ grado, grupos, anio }: { grado: Grado; grupos: Grupo[]; anio: number }) {
    const [abierto, setAbierto] = useState(false);
    const [valores, setValores] = useState<Record<number, string>>({});
    const [todos, setTodos] = useState('');
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [guardando, setGuardando] = useState(false);

    const abrir = () => {
        setValores(Object.fromEntries(grupos.map((g) => [g.id, String(g.cupos)])));
        setTodos('');
        setErrores({});
        setAbierto(true);
    };

    const cambiados = grupos.filter((g) => valores[g.id] !== undefined && Number(valores[g.id]) !== g.cupos);

    const guardar = () => {
        if (!cambiados.length) return setAbierto(false);
        setGuardando(true);
        router.put(
            '/grupos/cupos',
            { cupos: Object.fromEntries(cambiados.map((g) => [g.id, Number(valores[g.id])])) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setAbierto(false);
                    sileo.success({
                        title: cambiados.length === 1 ? 'Cupo guardado' : `${cambiados.length} cupos guardados`,
                        description: cambiados.map((g) => `${g.codigo}: ${valores[g.id]}`).join(' · '),
                    });
                },
                onError: (e) => {
                    setErrores(e);
                    sileo.warning({ title: 'Revisa los cupos', description: 'Deben ser números entre 1 y 99.' });
                },
                onFinish: () => setGuardando(false),
            },
        );
    };

    const variasSedes = new Set(grupos.map((g) => g.sede_codigo)).size > 1;

    return (
        <>
            <button
                type="button"
                onClick={abrir}
                disabled={!grupos.length}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] focus-visible:ring-4 focus-visible:ring-[#B7C6EA] focus-visible:outline-none disabled:opacity-40"
            >
                <SlidersHorizontal className="size-4" />
                Cupos
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !guardando && setAbierto(v)}>
                <DialogContent className="max-w-md rounded-[22px] border-[#E3E9F6] p-6 font-sans text-[#16223F] sm:rounded-[22px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            Cupos de {grado.nombre} · {anio}
                        </DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            Cuántos estudiantes caben en cada grupo. Se usa para las alertas de «sobre el cupo»; no impide matricular ni promover.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-2 rounded-[14px] bg-[#F2F5FA] p-2.5 pl-3.5">
                        <span className="flex-1 text-[14px] text-[#3E4A68]">El mismo cupo para todos</span>
                        <input
                            type="number"
                            min={1}
                            max={99}
                            inputMode="numeric"
                            value={todos}
                            onChange={(e) => setTodos(e.target.value)}
                            placeholder="—"
                            aria-label="Cupo para todos los grupos"
                            className={campo}
                        />
                        <button
                            type="button"
                            disabled={!todos}
                            onClick={() => setValores(Object.fromEntries(grupos.map((g) => [g.id, todos])))}
                            className="h-10 cursor-pointer rounded-full bg-white px-3.5 text-[14px] font-semibold text-[#1E3A7B] ring-1 ring-[#D3DDF3] transition hover:bg-[#EEF2FB] disabled:cursor-default disabled:opacity-40"
                        >
                            Aplicar
                        </button>
                    </div>

                    <ul className="max-h-[46vh] divide-y divide-[#EEF2F9] overflow-y-auto">
                        {grupos.map((g) => {
                            const valor = valores[g.id] ?? '';
                            const exceso = g.activos - Number(valor || 0);
                            const error = errores[`cupos.${g.id}`];
                            return (
                                <li key={g.id} className="flex items-center gap-3 py-2.5">
                                    <span className="w-14 text-[16px] font-semibold tabular-nums">{g.codigo}</span>
                                    <span className="min-w-0 flex-1 text-[13px] text-[#56627F]">
                                        {variasSedes && (
                                            <span className="mr-2 inline-flex items-center gap-1.5">
                                                <PuntoSede codigo={g.sede_codigo} />
                                                {sedeInfo(g.sede_codigo).corto}
                                            </span>
                                        )}
                                        <span className={cn('tabular-nums', valor && exceso > 0 && 'font-medium text-[#B42318]')}>
                                            {g.activos} activos{valor && exceso > 0 ? ` · +${exceso} sobre el cupo` : ''}
                                        </span>
                                        {error && <span className="block text-[#B42318]">{error}</span>}
                                    </span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        inputMode="numeric"
                                        value={valor}
                                        onChange={(e) => setValores((v) => ({ ...v, [g.id]: e.target.value }))}
                                        aria-label={`Cupo del grupo ${g.codigo}`}
                                        aria-invalid={!!error}
                                        className={campo}
                                    />
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center justify-end gap-2">
                        <span className="mr-auto text-[13px] text-[#56627F]">
                            {cambiados.length ? `${cambiados.length} con cambios` : 'Sin cambios'}
                        </span>
                        <button type="button" onClick={() => setAbierto(false)} disabled={guardando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button type="button" onClick={guardar} disabled={guardando || !cambiados.length} className={botonPrimario}>
                            {guardando && <LoaderCircle className="size-4 animate-spin" />}
                            Guardar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
