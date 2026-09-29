import { cifra } from '@/lib/informe';
import { cn } from '@/lib/utils';

/**
 * Gráficos del informe, en SVG o con cajas de ancho proporcional: se imprimen
 * nítidos y no necesitan ninguna librería.
 */

export const colores = {
    fuerte: '#1E3A7B',
    claro: '#B3C4EE',
    rejilla: '#F1F4FA',
    texto: '#56627F',
    ninas: '#C2507A',
    ninos: '#2B8A8A',
    manana: '#1E3A7B',
    tarde: '#D08A2B',
    alerta: '#D05454',
};

/** Color de cada sede (los mismos puntos de la página de Estudiantes). */
export const colorSede: Record<string, string> = { P: '#1E3A7B', LF: '#5B7BD0', CP: '#23948C', RP: '#D08A1E', PT: '#C04E83' };

/** Del más claro al más fuerte: preescolar, primaria, secundaria, media. */
export const colorNivel: Record<string, string> = { preescolar: '#B3C4EE', primaria: '#6E8BD6', secundaria: '#1E3A7B', media: '#0E1D45' };

type Columna = { etiqueta: string; partes: { valor: number; color: string }[]; total?: number };

/** Barras verticales apiladas, con el total encima de cada una. */
export function Columnas({ datos, ancho, alto, rejilla = 3 }: { datos: Columna[]; ancho: number; alto: number; rejilla?: number }) {
    const max = Math.max(1, ...datos.map((d) => d.total ?? d.partes.reduce((s, p) => s + p.valor, 0)));
    const tope = Math.ceil(max / 50) * 50 || 1;
    const zona = alto - 22;
    const paso = ancho / datos.length;
    const barra = Math.min(40, paso * 0.58);

    return (
        <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} className="block overflow-visible font-sans">
            {Array.from({ length: rejilla + 1 }, (_, i) => {
                const y = zona - (i / rejilla) * zona;
                return <line key={i} x1={0} x2={ancho} y1={y} y2={y} stroke={i === 0 ? '#D3DDF3' : colores.rejilla} />;
            })}
            {datos.map((d, i) => {
                const x = i * paso + (paso - barra) / 2;
                const total = d.total ?? d.partes.reduce((s, p) => s + p.valor, 0);
                let y = zona;
                return (
                    <g key={d.etiqueta}>
                        {d.partes.map((p, j) => {
                            const h = (p.valor / tope) * zona;
                            y -= h;
                            return <rect key={j} x={x} y={y} width={barra} height={Math.max(0, h)} fill={p.color} rx={j === d.partes.length - 1 ? 3 : 0} />;
                        })}
                        <text x={x + barra / 2} y={zona - (total / tope) * zona - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill="#16223F">
                            {cifra(total)}
                        </text>
                        <text x={x + barra / 2} y={alto - 6} textAnchor="middle" fontSize={10.5} fill={colores.texto}>
                            {d.etiqueta}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/** Anillo con partes (jornadas, niveles). */
export function Anillo({ partes, radio = 40, grosor = 12 }: { partes: { valor: number; color: string }[]; radio?: number; grosor?: number }) {
    const total = partes.reduce((s, p) => s + p.valor, 0) || 1;
    const lado = radio * 2 + grosor;
    const c = lado / 2;
    let angulo = -Math.PI / 2;

    return (
        <svg viewBox={`0 0 ${lado} ${lado}`} width={lado} height={lado} className="block shrink-0">
            <circle cx={c} cy={c} r={radio} fill="none" stroke={colores.rejilla} strokeWidth={grosor} />
            {partes
                .filter((p) => p.valor > 0)
                .map((p, i) => {
                    const fraccion = p.valor / total;
                    if (fraccion >= 0.9999) return <circle key={i} cx={c} cy={c} r={radio} fill="none" stroke={p.color} strokeWidth={grosor} />;
                    const a2 = angulo + fraccion * 2 * Math.PI;
                    const d = `M${c + radio * Math.cos(angulo)},${c + radio * Math.sin(angulo)} A${radio},${radio} 0 ${fraccion > 0.5 ? 1 : 0} 1 ${c + radio * Math.cos(a2)},${c + radio * Math.sin(a2)}`;
                    angulo = a2;
                    return <path key={i} d={d} fill="none" stroke={p.color} strokeWidth={grosor} />;
                })}
        </svg>
    );
}

/** Una fila: nombre, barra proporcional al máximo y la cifra. */
export function FilaBarra({
    etiqueta,
    valor,
    max,
    color = colores.fuerte,
    detalle,
    anchoEtiqueta = 128,
}: {
    etiqueta: string;
    valor: number;
    max: number;
    color?: string;
    detalle?: string;
    anchoEtiqueta?: number;
}) {
    return (
        <div className="flex h-[26px] items-center gap-[10px] border-b border-[#F1F4FA] text-[11.5px]">
            <span className="shrink-0 truncate" style={{ width: anchoEtiqueta }}>
                {etiqueta}
            </span>
            <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#F1F4FA]">
                <span className="block h-full rounded-full" style={{ width: `${max ? (valor / max) * 100 : 0}%`, background: color }} />
            </span>
            {detalle && <span className="w-[42px] shrink-0 text-right text-[10.5px] text-[#6B7690] tabular-nums">{detalle}</span>}
            <b className="w-[40px] shrink-0 text-right font-semibold tabular-nums">{cifra(valor)}</b>
        </div>
    );
}

/** Barra horizontal al 100 % partida en tramos (niñas y niños, mañana y tarde…). */
export function Barra100({ partes, className }: { partes: { valor: number; color: string }[]; className?: string }) {
    const total = partes.reduce((s, p) => s + p.valor, 0) || 1;
    return (
        <span className={cn('flex h-[8px] overflow-hidden rounded-full bg-[#F1F4FA]', className)}>
            {partes.map((p, i) => (
                <span key={i} className="block h-full" style={{ width: `${(p.valor / total) * 100}%`, background: p.color }} />
            ))}
        </span>
    );
}

/** Ocupación de un grupo o sede: barra con el cupo como tope; lo que pasa del cupo va en rojo. */
export function Ocupacion({ activos, cupos }: { activos: number; cupos: number }) {
    const lleno = cupos > 0 ? Math.min(activos / cupos, 1) : 0;
    const sobre = cupos > 0 && activos > cupos;
    return (
        <span className="flex h-[6px] w-full overflow-hidden rounded-full bg-[#F1F4FA]">
            <span className="block h-full" style={{ width: `${lleno * 100}%`, background: sobre ? colores.alerta : colores.fuerte }} />
        </span>
    );
}

/** Leyenda de colores. */
export function Leyenda({ items, className }: { items: { texto: string; color: string }[]; className?: string }) {
    return (
        <div className={cn('flex flex-wrap gap-x-[14px] gap-y-1 text-[10.5px] text-[#56627F]', className)}>
            {items.map((i) => (
                <span key={i.texto} className="inline-flex items-center gap-[5px]">
                    <span className="inline-block size-[8px] rounded-full" style={{ background: i.color }} />
                    {i.texto}
                </span>
            ))}
        </div>
    );
}
