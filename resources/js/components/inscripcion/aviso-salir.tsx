import { BotonPrincipal } from '@/components/inscripcion/controles';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { TriangleAlert } from 'lucide-react';

/**
 * Antes de salir del formulario con datos sin enviar (el botón "Volver"): en vez del
 * confirm() del navegador, un aviso con el estilo de la inscripción. Lo seguro va
 * primero y queda enfocado: seguir llenando. Salir es la segunda opción, en rojo.
 */
export function AvisoSalir({ abierto, onSeguir, onSalir }: { abierto: boolean; onSeguir: () => void; onSalir: () => void }) {
    return (
        <Dialog open={abierto} onOpenChange={(v) => !v && onSeguir()}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[440px] gap-0 rounded-[28px] border-[#E3E9F6] p-7 text-[#16223F] sm:rounded-[28px]">
                <span aria-hidden className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#FFF3DD] text-[#8A5A0B]">
                    <TriangleAlert className="size-[22px]" />
                </span>
                <DialogTitle className="text-[22px] leading-tight font-semibold tracking-[-0.02em]">¿Salir de la inscripción?</DialogTitle>
                <DialogDescription className="mt-2 text-[15px] leading-relaxed text-[#56627F]">
                    Lo que escribiste todavía no se ha enviado. Si sales ahora, se pierde y tendrás que empezar de nuevo.
                </DialogDescription>

                {/* En el código va primero "Seguir" (recibe el foco); en pantalla ancha queda a la derecha. */}
                <div className="mt-7 flex flex-col gap-2 sm:flex-row-reverse">
                    <BotonPrincipal type="button" onClick={onSeguir} className="h-12 rounded-[16px] px-5 text-[15px] sm:flex-1">
                        Seguir con la inscripción
                    </BotonPrincipal>
                    <button
                        type="button"
                        onClick={onSalir}
                        className="flex h-12 cursor-pointer items-center justify-center rounded-[16px] px-5 text-[15px] font-semibold text-[#A12B2B] transition-colors duration-200 hover:bg-[#FDF3F2] focus-visible:ring-4 focus-visible:ring-[#F6D5D2] focus-visible:outline-none"
                    >
                        Salir sin enviar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
