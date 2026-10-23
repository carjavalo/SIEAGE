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
    grupos: Array<{ id: number; codigo: string; sede: string; sede_id: number; grado_id: number }>;
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

    const gruposDelGradoYSede = grupos.filter(
        (g) => g.grado_id === gradoActual && (sedeId ? g.sede_id.toString() === sedeId : true),
    );

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
                    sileo.success({ title: 'Cambio registrado', description: `${nombre} cambió de grupo y/o sede.` });
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
                Cambiar de grupo o sede
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Cambiar de grupo o sede</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            {nombre} está en <b className="font-semibold text-[#16223F]">{grupoActual}</b> ({sedeActual}). Elige el nuevo grupo
                            y/o sede del mismo grado.
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
                                disabled={enviando || gruposDelGradoYSede.length === 0}
                                className="w-full px-4 py-2 border border-[#D3DDF3] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1E3A7B]"
                            >
                                <option value="">Elige un grupo...</option>
                                {gruposDelGradoYSede.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.codigo} ({g.sede})
                                    </option>
                                ))}
                            </select>
                            {gruposDelGradoYSede.length === 0 && sedeId && (
                                <p className="text-xs text-[#A12B2B] mt-1">No hay grupos disponibles en esta sede</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#16223F] mb-2">Razón del cambio</label>
                            <textarea
                                value={razon}
                                onChange={(e) => setRazon(e.target.value)}
                                disabled={enviando}
                                placeholder="Explica por qué cambia de grupo o sede..."
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


