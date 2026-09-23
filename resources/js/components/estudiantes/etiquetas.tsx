import { cn } from '@/lib/utils';

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

export function iniciales(nombre: string) {
    return nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
}
