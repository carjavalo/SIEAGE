import { dialogo } from '@/components/estudiantes/deshabilitar';
import { botonSecundario } from '@/components/formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { LoaderCircle, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';

/**
 * Deshacer la matrícula de un inscrito: vuelve a Inscritos, pendiente, para
 * matricularlo otra vez (en otro grupo o año) o dejarlo así. Ver InscritoController::devolver.
 */
export function DevolverAInscritos({ solicitudId, nombre, className }: { solicitudId: number; nombre: string; className?: string }) {
    const [abierto, setAbierto] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const confirmar = () =>
        router.post(
            `/inscritos/${solicitudId}/devolver`,
            {},
            {
                onStart: () => setEnviando(true),
                onFinish: () => setEnviando(false),
                onSuccess: () => {
                    setAbierto(false);
                    sileo.success({ title: 'Volvió a inscritos', description: `${nombre} quedó pendiente de matricular.` });
                },
                onError: (errores) => sileo.error({ title: 'No se pudo devolver', description: errores.devolver }),
            },
        );

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
                <Undo2 className="size-4" />
                Devolver a inscritos
            </button>

            <Dialog open={abierto} onOpenChange={(v) => !enviando && setAbierto(v)}>
                <DialogContent className={dialogo}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Devolver a inscritos</DialogTitle>
                        <DialogDescription className="text-[#56627F]">
                            Se deshace la matrícula de {nombre} y la inscripción vuelve a <b className="font-semibold text-[#16223F]">pendiente</b>,
                            con sus datos, la madre, el padre y los documentos recibidos. Desde Inscritos se puede matricular otra vez en el grupo o
                            el año correcto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAbierto(false)} disabled={enviando} className={botonSecundario}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={enviando}
                            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#1E3A7B] px-5 text-[15px] font-semibold text-white transition hover:bg-[#172E63] disabled:cursor-default disabled:opacity-50"
                        >
                            {enviando && <LoaderCircle className="size-4 animate-spin" />}
                            Devolver a inscritos
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
