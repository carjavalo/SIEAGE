import { BotonGuardar, tarjeta } from '@/components/formulario';
import { Lavado } from '@/components/lavado';
import PanelLayout from '@/layouts/panel-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, FileSpreadsheet, UploadCloud, X } from 'lucide-react';
import { type ChangeEvent, type DragEvent, type FormEventHandler, useState } from 'react';
import { sileo } from 'sileo';

const EXTENSIONES = ['xlsx', 'xls'];
const TAMANO_MAXIMO = 20 * 1024 * 1024;

function formatearTamano(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validarArchivo(archivo: File): string | null {
    const extension = archivo.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES.includes(extension)) return 'El archivo debe ser .xlsx o .xls.';
    if (archivo.size > TAMANO_MAXIMO) return 'El archivo no puede superar los 20 MB.';
    return null;
}

/** Importar datos: se sube el libro de Excel de matrículas y queda guardado en el servidor para procesarlo. */
export default function ImportarDatos() {
    const { flash } = usePage<SharedData>().props;
    const [arrastrando, setArrastrando] = useState(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);
    const form = useForm<{ archivo: File | null }>({ archivo: null });

    const seleccionar = (archivo: File | undefined) => {
        if (!archivo) return;
        form.clearErrors();
        const error = validarArchivo(archivo);
        setErrorLocal(error);
        form.setData('archivo', error ? null : archivo);
    };

    const alSoltar = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setArrastrando(false);
        seleccionar(e.dataTransfer.files[0]);
    };

    const alCambiar = (e: ChangeEvent<HTMLInputElement>) => {
        seleccionar(e.target.files?.[0]);
        e.target.value = '';
    };

    const quitar = () => {
        form.reset();
        form.clearErrors();
        setErrorLocal(null);
    };

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('importaciones.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                sileo.success({ title: 'Archivo recibido', description: 'Quedó guardado en el servidor.' });
            },
        });
    };

    const error = errorLocal ?? form.errors.archivo;
    const archivo = form.data.archivo;

    return (
        <PanelLayout titulo="Importar datos">
            <Lavado />

            <div className="relative max-w-[720px]">
                <h1 className="text-[28px] leading-8 font-semibold tracking-[-0.025em]">Importar datos</h1>
                <p className="mt-1 text-[15px] text-[#56627F]">
                    Sube el libro de Excel de matrículas, el mismo con el que se trabaja cada año. Queda guardado en el servidor para cargar
                    estudiantes, acudientes y grupos.
                </p>

                {flash.success && !archivo && (
                    <p className="mt-5 flex items-center gap-3 rounded-[16px] bg-[#E3F4EC] px-4 py-3 text-[14px] font-medium text-[#1C6B4A]">
                        <CheckCircle2 className="size-[18px] shrink-0" />
                        {flash.success}
                    </p>
                )}

                <form onSubmit={enviar} className={cn(tarjeta, 'mt-5')}>
                    <div className="p-6">
                        {!archivo ? (
                            <label
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setArrastrando(true);
                                }}
                                onDragLeave={() => setArrastrando(false)}
                                onDrop={alSoltar}
                                className={cn(
                                    'group flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed px-6 py-14 text-center transition duration-200 focus-within:ring-4 focus-within:ring-[#DCE5F8]',
                                    arrastrando
                                        ? 'scale-[1.01] border-[#1E3A7B] bg-[#EEF2FB]'
                                        : error
                                          ? 'border-[#E0897D] bg-[#FDF3F1]'
                                          : 'border-[#C4D2F1] bg-[#F7F9FF] hover:border-[#6E8BD6] hover:bg-[#EEF2FB]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-[#1E3A7B] shadow-[0_8px_20px_-12px_rgba(30,58,123,0.5)] ring-1 ring-[#DCE5F8] transition-transform',
                                        arrastrando ? 'scale-110' : 'group-hover:scale-105',
                                    )}
                                >
                                    <UploadCloud className="size-6" />
                                </span>
                                <span className="text-[16px] font-semibold text-[#16223F]">
                                    {arrastrando ? 'Suelta el archivo aquí' : 'Arrastra aquí el libro de Excel'}
                                </span>
                                <span className="mt-1 text-[14px] text-[#56627F]">
                                    o <span className="font-medium text-[#1E3A7B] underline underline-offset-4">haz clic para elegirlo</span>
                                </span>
                                <span className="mt-5 text-[13px] text-[#6B7690]">.xlsx o .xls · máximo 20 MB</span>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                    onChange={alCambiar}
                                    className="sr-only"
                                />
                            </label>
                        ) : (
                            <div className="rounded-[16px] bg-[#F5F7FC] p-4">
                                <div className="flex items-center gap-4">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-[#E3F4EC] text-[#1C6B4A]">
                                        <FileSpreadsheet className="size-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[15px] font-semibold text-[#16223F]">{archivo.name}</p>
                                        <p className="text-[13px] text-[#56627F]">
                                            {formatearTamano(archivo.size)}
                                            {form.processing && ` · subiendo ${form.progress?.percentage ?? 0} %`}
                                        </p>
                                    </div>
                                    {!form.processing && (
                                        <button
                                            type="button"
                                            onClick={quitar}
                                            aria-label="Quitar el archivo"
                                            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#56627F] transition hover:bg-white hover:text-[#16223F]"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                                {form.processing && (
                                    <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-[#E3E9F6]">
                                        <div
                                            className="h-full rounded-full bg-[#1E3A7B] transition-all duration-300"
                                            style={{ width: `${form.progress?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="mt-3 text-center text-[14px] text-[#B42318]">{error}</p>}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F9] px-6 py-3.5">
                        <span className="mr-auto text-[14px] text-[#56627F]">Subirlo no cambia ningún dato todavía.</span>
                        <BotonGuardar cargando={form.processing} disabled={!archivo}>
                            {form.processing ? 'Subiendo…' : 'Subir archivo'}
                        </BotonGuardar>
                    </div>
                </form>
            </div>
        </PanelLayout>
    );
}
