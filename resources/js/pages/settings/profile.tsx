import { BotonGuardar, Campo, EstadoGuardado, claseCampo, tarjeta } from '@/components/formulario';
import ConfiguracionLayout from '@/layouts/configuracion-layout';
import { haceCuanto, inicialesPersona, nombreRol, puntoRol } from '@/lib/usuarios';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { type FormEventHandler } from 'react';
import { sileo } from 'sileo';

type Props = { rol: string | null };

/** Mi perfil: nombre y correo. El usuario con que se ingresa solo lo cambia un administrador. */
export default function Perfil({ rol }: Props) {
    const { auth } = usePage<SharedData>().props;
    const yo = auth.user;
    const form = useForm({ name: yo.name, email: yo.email ?? '' });

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
        form.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();
                sileo.success({ title: 'Perfil actualizado', description: 'Tus datos quedaron guardados.' });
            },
            onError: () => sileo.warning({ title: 'Revisa los datos', description: 'Marcamos en rojo lo que falta o está mal.' }),
        });
    };

    return (
        <ConfiguracionLayout titulo="Mi perfil">
            <form onSubmit={guardar} className={tarjeta}>
                <div className="flex items-center gap-4 border-b border-[#EEF2F9] px-6 py-5">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-[#1E3A7B] text-[18px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(30,58,123,0.7)]">
                        {inicialesPersona(yo.name)}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[20px] leading-7 font-semibold tracking-[-0.015em]">{yo.name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#56627F]">
                            <span className="font-medium text-[#3E4A68]">@{yo.usuario}</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span aria-hidden className={cn('size-2 rounded-full', puntoRol(rol))} />
                                {nombreRol(rol)}
                            </span>
                            <span>Último ingreso: {haceCuanto((yo.ultimo_acceso as string | null) ?? null).toLowerCase()}</span>
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Campo id="name" etiqueta="Nombre completo" error={form.errors.name}>
                            <input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                autoComplete="name"
                                aria-invalid={!!form.errors.name}
                                className={claseCampo}
                            />
                        </Campo>
                    </div>
                    <Campo id="usuario" etiqueta="Usuario para ingresar" ayuda="Solo un administrador puede cambiarlo, desde Usuarios.">
                        <div className="relative">
                            <input id="usuario" value={yo.usuario} disabled aria-describedby="usuario-ayuda" className={cn(claseCampo, 'pr-10')} />
                            <Lock aria-hidden className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#8C97B3]" />
                        </div>
                    </Campo>
                    <Campo id="email" etiqueta="Correo" opcional error={form.errors.email}>
                        <input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            autoComplete="email"
                            placeholder="nombre@correo.com"
                            aria-invalid={!!form.errors.email}
                            className={claseCampo}
                        />
                    </Campo>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F9] px-6 py-3.5">
                    <span className="mr-auto">
                        <EstadoGuardado sucio={form.isDirty} />
                    </span>
                    <BotonGuardar cargando={form.processing}>Guardar cambios</BotonGuardar>
                </div>
            </form>
        </ConfiguracionLayout>
    );
}
