import { plano } from '@/lib/estudiantes';
import { cn } from '@/lib/utils';
import { Fragment } from 'react';

const estados: Record<string, string> = {
    activo: 'bg-[#E3F4EC] text-[#1C6B4A]',
    retirado: 'bg-[#FDECEC] text-[#A12B2B]',
    cancelado: 'bg-[#F1F2F6] text-[#4E566B]',
    trasladado: 'bg-[#FFF3DD] text-[#8A5A0B]',
    graduado: 'bg-[#E6ECFB] text-[#1E3A7B]',
};

const condiciones: Record<string, string> = {
    nuevo: 'bg-[#E6ECFB] text-[#1E3A7B]',
    antiguo: 'bg-[#F1F2F6] text-[#4E566B]',
    repitente: 'bg-[#FFF3DD] text-[#8A5A0B]',
    trasladado: 'bg-[#F3EAFB] text-[#6B3A9A]',
};

export const sedes: Record<string, string> = {
    P: 'bg-[#1E3A7B] text-white',
    LF: 'bg-[#DCE5F8] text-[#1E3A7B]',
    CP: 'bg-[#DDF1F3] text-[#17606A]',
    RP: 'bg-[#FFF0D9] text-[#855410]',
    PT: 'bg-[#FBE7F0] text-[#8E2A57]',
};

const pastilla = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap';

export function Estado({ valor }: { valor: string }) {
    return <span className={cn(pastilla, estados[valor] ?? estados.cancelado)}>{valor}</span>;
}

export function Condicion({ valor }: { valor: string }) {
    return <span className={cn(pastilla, condiciones[valor] ?? condiciones.antiguo)}>{valor}</span>;
}

export function Sede({ codigo, nombre }: { codigo: string; nombre?: string }) {
    return (
        <span className={cn(pastilla, 'normal-case', sedes[codigo] ?? sedes.LF)} title={nombre}>
            {nombre ?? codigo}
        </span>
    );
}

/** Sedes en el listado: un punto de color y un nombre corto, sin pastillas rellenas. */
export const infoSedes: Record<string, { orden: number; corto: string; punto: string }> = {
    P: { orden: 0, corto: 'Principal', punto: 'bg-[#1E3A7B]' },
    LF: { orden: 1, corto: 'LF', punto: 'bg-[#5B7BD0]' },
    CP: { orden: 2, corto: 'Provivienda', punto: 'bg-[#23948C]' },
    RP: { orden: 3, corto: 'Rafael Pombo', punto: 'bg-[#D08A1E]' },
    PT: { orden: 4, corto: 'Purificación', punto: 'bg-[#C04E83]' },
};

export const sedeInfo = (codigo: string | null | undefined) => infoSedes[codigo ?? ''] ?? { orden: 9, corto: codigo ?? '—', punto: 'bg-[#8C97B3]' };

export function PuntoSede({ codigo, className }: { codigo: string | null | undefined; className?: string }) {
    return <span aria-hidden className={cn('size-2 shrink-0 rounded-full', sedeInfo(codigo).punto, className)} />;
}

/** Situación por excepción: un punto y la palabra, sin pastilla. */
const situaciones: Record<string, { texto: string; color: string; punto: string }> = {
    retirado: { texto: 'Retirado', color: 'text-[#A12B2B]', punto: 'bg-[#D05454]' },
    cancelado: { texto: 'Cancelado', color: 'text-[#4E566B]', punto: 'bg-[#8C97B3]' },
    trasladado: { texto: 'Trasladado', color: 'text-[#8A5A0B]', punto: 'bg-[#D99A2B]' },
    graduado: { texto: 'Graduado', color: 'text-[#1E3A7B]', punto: 'bg-[#5B7BD0]' },
    repitente: { texto: 'Repitente', color: 'text-[#8A5A0B]', punto: 'bg-[#D99A2B]' },
    nuevo: { texto: 'Nuevo', color: 'text-[#2F56B0]', punto: 'bg-[#5B7BD0]' },
    activo: { texto: 'Activo', color: 'text-[#1C6B4A]', punto: 'bg-[#3BA67A]' },
    antiguo: { texto: 'Antiguo', color: 'text-[#4E566B]', punto: 'bg-[#AEB7CC]' },
};

export const textoSituacion = (clave: string) => situaciones[clave]?.texto ?? clave;

export function Marca({ valor, className }: { valor: string; className?: string }) {
    const s = situaciones[valor] ?? situaciones.cancelado;
    return (
        <span className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap', s.color, className)}>
            <span aria-hidden className={cn('size-1.5 rounded-full', s.punto)} />
            {s.texto}
        </span>
    );
}

/** Resalta cada palabra buscada dentro del texto, sin distinguir tildes ni mayúsculas. */
export function Resaltado({ texto, buscadas }: { texto: string; buscadas: string[] }) {
    if (!buscadas.length) return texto;
    // plano() conserva la longitud de cada letra (quita solo las tildes combinadas), así que las posiciones coinciden.
    const base = plano(texto);
    const marcado = new Array<boolean>(texto.length).fill(false);
    for (const p of buscadas) {
        for (let i = base.indexOf(p); i >= 0; i = base.indexOf(p, i + 1)) marcado.fill(true, i, i + p.length);
    }
    const tramos: { texto: string; marcado: boolean }[] = [];
    for (let i = 0; i < texto.length; i++) {
        const ultimo = tramos[tramos.length - 1];
        if (ultimo && ultimo.marcado === marcado[i]) ultimo.texto += texto[i];
        else tramos.push({ texto: texto[i], marcado: marcado[i] });
    }
    return tramos.map((t, i) =>
        t.marcado ? (
            <mark key={i} className="rounded-[3px] bg-[#FFE9A8] text-inherit">
                {t.texto}
            </mark>
        ) : (
            <Fragment key={i}>{t.texto}</Fragment>
        ),
    );
}

/** Nombres "Apellido Apellido Nombre": primer apellido + primer nombre. */
export function iniciales(nombre: string) {
    const p = nombre.split(/\s+/).filter(Boolean);
    return ((p[0]?.[0] ?? '') + ((p.length >= 3 ? p[2] : p[1])?.[0] ?? '')).toUpperCase();
}
