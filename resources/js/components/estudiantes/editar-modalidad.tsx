import { dialogo } from '@/components/estudiantes/deshabilitar';
import { botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { LoaderCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';

/** Digitar o corregir a mano la modalidad (media técnica) de la matrícula, desde la ficha. */
export function EditarModalidad({
    estudianteId,
    matriculaId,
    modalidad,
}: {
    estudianteId: number;
    matriculaId: number;
    modalidad: string | null;
}) {
    const [abierto, setAbierto] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [valor, setValor] = useState(modalidad ?? '');

    const guardar = () => {
        router.put(
            `/estudiantes/${estudianteId}/modalidad`,
            { matricula_id: matriculaId, modalidad: valor.trim() },
            {
                preserveScroll: true,
                onStart: () => setEnviando(true),
                onFinish: () => setEnviando(false),
                onSuccess: () => {
                    setAbierto(false);
                    sileo.success({ title: 'Modalidad actualizada' });
                },
                onError: (errores) => sileo.error({ title: 'No se pudo guardar', description: Object.values(errores)[0] as string }),
            },
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setValor(modalidad ?? '');
                    setAbierto(true);
                }}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1E3A7B] underline-offset-4 hover:underline"
            >
                <Pencil className="size-3.5" />
                {modalidad ? 'Editar modalidad' : 'Agregar modalidad'}
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Modalidad</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            Escribe la modalidad (media técnica) de esta matrícula. Déjalo vacío para quitarla.
                        </DialogDescription>
                    </DialogHeader>
                    <input
                        type="text"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        disabled={enviando}
                        maxLength={40}
                        placeholder="Ej.: Programación de software"
                        className="w-full rounded-lg border border-[#D3DDF3] px-4 py-2 text-[14px] focus:ring-2 focus:ring-[#1E3A7B] focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && !enviando && guardar()}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierto(false)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={guardar}
                            disabled={enviando}
                            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] disabled:opacity-50"
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            Guardar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
