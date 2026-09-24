import { Marca } from '@/components/estudiantes/etiquetas';
import { Bloque, ContenidoFicha, PanelFicha, TarjetaContacto } from '@/components/ficha';
import { edad, fecha, telefono } from '@/lib/estudiantes';
import {
    type FichaInscrito as Ficha,
    type PadreGuardado,
    type Rol,
    enlaceEstudiante,
    hace,
    inicialesInscrito,
    nombreAcudiente,
    nombreInscrito,
    nombrePadre,
    padresListos,
    parentescoAcudiente,
} from '@/lib/inscritos';
import { GraduationCap, MapPin, UserPen } from 'lucide-react';
import { type ReactNode, type RefObject } from 'react';

type Props = {
    ficha: Ficha | null;
    abierta: boolean;
    cargando: boolean;
    posicion: number;
    total: number;
    panel: RefObject<HTMLElement | null>;
    onCerrar: () => void;
    onMover: (paso: 1 | -1) => void;
};

/** Ficha del inscrito elegido, al lado de la lista: lo que llenó la familia y cómo van la madre y el padre. */
export function FichaInscrito({ ficha, abierta, panel, ...resto }: Props) {
    return (
        <PanelFicha abierta={abierta} panel={panel} etiqueta="Ficha del inscrito">
            {ficha && <Contenido ficha={ficha} {...resto} />}
        </PanelFicha>
    );
}

const ROLES: { clave: Rol; titulo: string; fallecido: string }[] = [
    { clave: 'madre', titulo: 'Madre', fallecido: 'Fallecida' },
    { clave: 'padre', titulo: 'Padre', fallecido: 'Fallecido' },
];

function Contenido({ ficha, ...resto }: Omit<Props, 'ficha' | 'abierta' | 'panel'> & { ficha: Ficha }) {
    const { solicitud: s, padres, matricula } = ficha;
    const anios = edad(s.fecha_nacimiento);
    const documento = s.tipo_documento === 'Otro' ? s.tipo_documento_otro : s.tipo_documento;

    return (
        <ContenidoFicha
            {...resto}
            iniciales={inicialesInscrito(s)}
            titulo={nombreInscrito(s)}
            detalle={
                <>
                    {documento} {s.numero_documento}
                    {anios !== null && ` · ${anios} años`}
                </>
            }
            marcas={
                <>
                    <span className="font-semibold text-[#1E3A7B]">
                        {matricula ? `${s.sexo === 'F' ? 'Matriculada' : 'Matriculado'} en ${matricula.grupo ?? s.grado}` : `Ingresa a ${s.grado}`}
                    </span>
                    <Marca valor={s.estado} />
                    <span className="text-[#56627F]">Enviada {hace(s.enviada).toLowerCase()}</span>
                </>
            }
            accion={
                // Cada etapa lleva a su paso: madre y padre → grupo → el estudiante ya matriculado.
                matricula
                    ? { href: enlaceEstudiante(matricula), texto: 'Verlo en Estudiantes', icono: GraduationCap }
                    : padresListos(padres) && s.estado === 'pendiente'
                      ? { href: `/inscritos/${s.id}/grupo`, texto: 'Elegir grupo y matricular', icono: GraduationCap }
                      : { href: `/inscritos/${s.id}`, texto: 'Completar madre y padre', icono: UserPen }
            }
        >
            <BloquesSolicitud solicitud={s} padres={padres} />
        </ContenidoFicha>
    );
}

/** Lo que llenó la familia, en bloques. Sin `padres`, no muestra el de la madre y el padre (la página del inscrito los edita aparte). */
export function BloquesSolicitud({ solicitud: s, padres }: { solicitud: Ficha['solicitud']; padres?: Ficha['padres'] }) {
    return (
        <div>
            <Bloque titulo="Acudiente">
                <TarjetaContacto
                    nombre={nombreAcudiente(s)}
                    detalle={`${parentescoAcudiente(s)} · C.C. ${s.acudiente_numero_documento}`}
                    celular={s.acudiente_telefono_1}
                    fijo={s.acudiente_telefono_2}
                    correo={s.acudiente_correo}
                />
            </Bloque>

            {padres && (
                <Bloque titulo="Madre y padre">
                    <div className="space-y-2">
                        {ROLES.map((r) => (
                            <Progenitor key={r.clave} rol={r} datos={padres[r.clave]} />
                        ))}
                    </div>
                </Bloque>
            )}

            <Bloque titulo="Estudiante">
                <Datos>
                    <Dato etiqueta="Nacimiento">{fecha(s.fecha_nacimiento)}</Dato>
                    <Dato etiqueta="Sexo">{s.sexo === 'F' ? 'Femenino' : 'Masculino'}</Dato>
                    <Dato etiqueta="Nació en">{[s.ciudad_nacimiento, s.pais_nacimiento].filter(Boolean).join(', ')}</Dato>
                    <Dato etiqueta="Documento expedido en">{s.ciudad_expedicion}</Dato>
                </Datos>
            </Bloque>

            <Bloque titulo="Salud">
                <Datos>
                    <Dato etiqueta="EPS">{s.eps}</Dato>
                    <Dato etiqueta="Tipo de sangre">{s.tipo_sangre}</Dato>
                    <Dato etiqueta="SISBÉN">{s.sisben === 'ninguno' ? 'No tiene' : `Nivel ${s.sisben}`}</Dato>
                    <Dato etiqueta="Grupo étnico">{s.grupo_etnico}</Dato>
                    <Dato etiqueta="Discapacidad" ancho>
                        {s.discapacidad || 'Ninguna'}
                    </Dato>
                </Datos>
            </Bloque>

            <Bloque titulo="Residencia">
                <p className="flex items-start gap-1.5 text-[14px] text-[#16223F]">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#6B7690]" />
                    {[s.direccion, s.barrio].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                    {[...new Set([s.telefono_1, s.telefono_2].filter(Boolean))].map((t) => (
                        <a key={t} href={`tel:${t}`} className="font-medium text-[#1E3A7B] tabular-nums hover:underline">
                            {telefono(t)}
                        </a>
                    ))}
                    {s.correo && (
                        <a href={`mailto:${s.correo}`} className="min-w-0 truncate text-[#1E3A7B] hover:underline">
                            {s.correo}
                        </a>
                    )}
                </div>
            </Bloque>
        </div>
    );
}

/** La madre o el padre: sus datos, "fallecido"/"no registra", o que falta completarlo. */
function Progenitor({ rol, datos }: { rol: (typeof ROLES)[number]; datos?: PadreGuardado }) {
    if (!datos) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-[16px] border-[1.5px] border-dashed border-[#D3DDF3] px-3.5 py-2.5">
                <p className="text-[15px] font-semibold text-[#16223F]">{rol.titulo}</p>
                <span className="text-[13px] font-medium text-[#8A5A0B]">Sin registrar</span>
            </div>
        );
    }
    if (datos.situacion !== 'registrado') {
        return (
            <div className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F5F7FC] px-3.5 py-2.5">
                <p className="text-[15px] font-semibold text-[#16223F]">{rol.titulo}</p>
                <span className="text-[13px] text-[#56627F]">{datos.situacion === 'fallecido' ? rol.fallecido : 'No registra'}</span>
            </div>
        );
    }
    return (
        <TarjetaContacto
            nombre={nombrePadre(datos)}
            detalle={[rol.titulo, datos.numero_documento && `${datos.tipo_documento ?? ''} ${datos.numero_documento}`.trim(), datos.ocupacion]
                .filter(Boolean)
                .join(' · ')}
            insignia={datos.es_acudiente ? 'Acudiente' : undefined}
            celular={datos.telefono}
            correo={datos.correo}
        />
    );
}

function Datos({ children }: { children: ReactNode }) {
    return <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">{children}</dl>;
}

function Dato({ etiqueta, ancho, children }: { etiqueta: string; ancho?: boolean; children: ReactNode }) {
    return (
        <div className={ancho ? 'col-span-2 min-w-0' : 'min-w-0'}>
            <dt className="text-[13px] text-[#6B7690]">{etiqueta}</dt>
            <dd className="mt-0.5 text-[14px] break-words text-[#16223F]">{children || '—'}</dd>
        </div>
    );
}
