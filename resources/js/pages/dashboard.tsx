import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, FileSpreadsheet, GraduationCap, LoaderCircle, UploadCloud, X } from 'lucide-react';
import { type ChangeEvent, type DragEvent, type FormEventHandler, useState } from 'react';

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

export default function Dashboard() {
    const { auth, name, flash } = usePage<SharedData>().props;
    const [arrastrando, setArrastrando] = useState(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);

    const { data, setData, post, processing, progress, errors, reset, clearErrors } = useForm<{ archivo: File | null }>({
        archivo: null,
    });

    const seleccionar = (archivo: File | undefined) => {
        if (!archivo) return;
        clearErrors();
        const error = validarArchivo(archivo);
        setErrorLocal(error);
        setData('archivo', error ? null : archivo);
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
        reset();
        clearErrors();
        setErrorLocal(null);
    };

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('importaciones.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const error = errorLocal ?? errors.archivo;

    return (
        <>
            <Head title="Inicio" />
            <div className="bg-background text-foreground flex min-h-screen flex-col">
                <header className="flex items-center justify-between px-6 py-5 md:px-10">
                    <div className="flex items-center gap-3">
                        <img src="/sieage-logo.png" alt="SIEAGE" className="h-11 w-auto rounded-md object-contain" />
                        <div className="leading-tight">
                            <p className="text-sm font-semibold tracking-tight">{name}</p>
                            <p className="text-muted-foreground text-xs">I.E. Alfonso López Pumarejo</p>
                        </div>
                    </div>
                    <Link
                        href="/estudiantes"
                        className="mr-3 ml-auto flex items-center gap-2 rounded-full bg-[#EEF2FB] px-4 py-2 text-sm font-medium text-[#1E3A7B] transition hover:bg-[#DCE5F8]"
                    >
                        <GraduationCap className="size-4" />
                        Estudiantes
                    </Link>
                    {auth.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hover:bg-accent flex items-center gap-2 rounded-full p-1 pr-3 text-sm transition-colors">
                                    <UserInfo user={auth.user} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </header>

                <main className="flex flex-1 items-center justify-center px-6 pb-24">
                    <div className="w-full max-w-xl">
                        <div className="mb-10 text-center">
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Importar datos</h1>
                            <p className="text-muted-foreground mt-3 text-sm md:text-base">
                                Sube el libro de Excel de matrículas para procesar estudiantes, acudientes y grupos.
                            </p>
                        </div>

                        {flash.success && !data.archivo && (
                            <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <CheckCircle2 className="size-4 shrink-0" />
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={enviar} className="space-y-4">
                            {!data.archivo ? (
                                <label
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setArrastrando(true);
                                    }}
                                    onDragLeave={() => setArrastrando(false)}
                                    onDrop={alSoltar}
                                    className={cn(
                                        'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all',
                                        arrastrando
                                            ? 'border-primary bg-accent scale-[1.01]'
                                            : 'border-border hover:border-muted-foreground/40 hover:bg-accent/50',
                                        error && 'border-destructive/60',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'bg-accent mb-5 flex size-14 items-center justify-center rounded-full transition-transform',
                                            arrastrando ? 'scale-110' : 'group-hover:scale-105',
                                        )}
                                    >
                                        <UploadCloud className="text-muted-foreground size-6" />
                                    </div>
                                    <p className="text-sm font-medium">{arrastrando ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo'}</p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        o <span className="text-foreground underline underline-offset-4">haz clic para seleccionarlo</span>
                                    </p>
                                    <p className="text-muted-foreground/70 mt-6 text-xs">.xlsx o .xls · máximo 20 MB</p>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                        onChange={alCambiar}
                                        className="sr-only"
                                    />
                                </label>
                            ) : (
                                <div className="rounded-2xl border p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                            <FileSpreadsheet className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{data.archivo.name}</p>
                                            <p className="text-muted-foreground text-xs">{formatearTamano(data.archivo.size)}</p>
                                        </div>
                                        {!processing && (
                                            <button
                                                type="button"
                                                onClick={quitar}
                                                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-full p-2 transition-colors"
                                                aria-label="Quitar archivo"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                    {processing && (
                                        <div className="bg-accent mt-4 h-1 overflow-hidden rounded-full">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-300"
                                                style={{ width: `${progress?.percentage ?? 0}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && <p className="text-destructive text-center text-sm">{error}</p>}

                            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={!data.archivo || processing}>
                                {processing && <LoaderCircle className="size-4 animate-spin" />}
                                {processing ? 'Subiendo…' : 'Procesar archivo'}
                            </Button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
