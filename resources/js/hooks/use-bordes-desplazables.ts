import { type RefObject, useLayoutEffect } from 'react';

/**
 * Las franjas que se desplazan de lado (grados, roles) sin barra de desplazamiento: el borde
 * se desvanece donde hay más contenido escondido, para que no parezca cortado. Marca
 * `data-antes` / `data-despues`; el degradado lo pone la clase `bordesDesvanecidos`.
 */
export function useBordesDesplazables(ref: RefObject<HTMLElement | null>) {
    useLayoutEffect(() => {
        const f = ref.current;
        if (!f) return;
        const medir = () => {
            f.dataset.antes = String(f.scrollLeft > 1);
            f.dataset.despues = String(f.scrollLeft + f.clientWidth < f.scrollWidth - 1);
        };
        const observador = new ResizeObserver(medir);
        observador.observe(f);
        f.addEventListener('scroll', medir, { passive: true });
        medir();
        return () => {
            observador.disconnect();
            f.removeEventListener('scroll', medir);
        };
    }, [ref]);
}

export const bordesDesvanecidos =
    '[--antes:#000] [--despues:#000] [mask-image:linear-gradient(to_right,var(--antes),#000_40px,#000_calc(100%-40px),var(--despues))] [scrollbar-width:none] data-[antes=true]:[--antes:transparent] data-[despues=true]:[--despues:transparent]';
