import { dialogo } from '@/components/estudiantes/deshabilitar';
import { botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { LoaderCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';

export function CambiarGrupo({
    estudianteId,
    nombre,
    grupoActual,
    sedeActual,
    grupos,
    gradoActual,
    className,
}: {
    estudianteId: number;
    nombre: string;
    grupoActual: string;
    sedeActual: string;
    grupos: Array<{ id: number; codigo: string; sede: string; sede_id: number; grado_id: number; grado: string; grado_numero: number }>;
    gradoActual: number;
    className?: string;
}) {
    const [abierto, setAbierto] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [sedeId, setSedeId] = useState('');
    const [grupoId, setGrupoId] = useState('');
    const [razon, setRazon] = useState('');

    const sedes = Array.from(new Set(grupos.map((g) => g.sede_id))).map((id) => {
        const g = grupos.find((x) => x.sede_id === id);
        return { id, nombre: g?.sede };
    });

    // Todos los grupos de la sede elegida (de cualquier grado), agrupados por grado.
    const gruposDeLaSede = grupos
        .filter((g) => (sedeId ? g.sede_id.toString() === sedeId : true))
        .sort((a, b) => a.grado_numero - b.grado_numero || a.codigo.localeCompare(b.codigo));
    const gradosDeLaSede = Array.from(new Set(gruposDeLaSede.map((g) => g.grado_id))).map((id) => {
        const g = gruposDeLaSede.find((x) => x.grado_id === id)!;
        return { id, nombre: g.grado, numero: g.grado_numero, grupos: gruposDeLaSede.filter((x) => x.grado_id === id) };
    });

    const cambiar = () => {
        if (!grupoId || !razon.trim()) return;

        router.post(
            `/estudiantes/${estudianteId}/cambiar-grupo`,
            { grupo_id: grupoId, razon },
            {
                onStart: () => setEnviando(true),
                onFinish: () => setEnviando(false),
                onSuccess: () => {
                    setAbierto(false);
                    setSedeId('');
                    setGrupoId('');
                    setRazon('');
                    sileo.success({ title: 'Cambio registrado', description: `${nombre} cambió de grupo, grado y/o sede.` });
                },
                onError: (errores) => sileo.error({ title: 'Error al cambiar', description: Object.values(errores)[0] as string }),
            },
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setAbierto(true)}
                className={cn(
                    'flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-4 text-[14px] font-semibold text-[#3E4A68] transition hover:bg-[#F5F7FC]',
                    className,
                )}
            >
                <TrendingUp className="size-4" />
                Cambiar de grupo, grado o sede
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Cambiar de grupo, grado o sede</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            {nombre} está en <b className="font-semibold text-[#16223F]">{grupoActual}</b> ({sedeActual}). Elige el nuevo grupo,
                            que puede ser de otro grado o sede.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#16223F] mb-2">Sede</label>
                            <select
                                value={sedeId}
                                onChange={(e) => {
                                    setSedeId(e.target.value);
                                    setGrupoId('');
                                }}
                                disabled={enviando}
                                className="w-full px-4 py-2 border border-[#D3DDF3] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1E3A7B]"
                            >
                                <option value="">Todas las sedes</option>
                                {sedes.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#16223F] mb-2">Nuevo grupo</label>
                            <select
                                value={grupoId}
                                onChange={(e) => setGrupoId(e.target.value)}
                                disabled={enviando || gruposDeLaSede.length === 0}
                                className="w-full px-4 py-2 border border-[#D3DDF3] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1E3A7B]"
                            >
                                <option value="">Elige un grupo...</option>
                                {gradosDeLaSede.map((gr) => (
                                    <optgroup key={gr.id} label={gr.nombre + (gr.id === gradoActual ? ' (grado actual)' : '')}>
                                        {gr.grupos.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.codigo} ({g.sede})
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            {gruposDeLaSede.length === 0 && sedeId && (
                                <p className="text-xs text-[#A12B2B] mt-1">No hay grupos disponibles en esta sede</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#16223F] mb-2">Razón del cambio</label>
                            <textarea
                                value={razon}
                                onChange={(e) => setRazon(e.target.value)}
                                disabled={enviando}
                                placeholder="Explica por qué cambia de grupo, grado o sede..."
                                minLength={10}
                                maxLength={300}
                                rows={3}
                                className="w-full px-4 py-2 border border-[#D3DDF3] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1E3A7B]"
                            />
                            <p className="text-xs text-[#8C97B3] mt-1">{razon.length}/300</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierto(false)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={cambiar}
                            disabled={enviando || !grupoId || razon.length < 10}
                            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] disabled:cursor-default disabled:opacity-50"
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            Cambiar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}


