import { BotonGuardar, Campo, CampoSecreto, tarjeta } from '@/components/formulario';
import ConfiguracionLayout from '@/layouts/configuracion-layout';
import { useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { type FormEventHandler, useRef } from 'react';
import { sileo } from 'sileo';

/** Mi clave: se pide la actual para confirmar que es la misma persona. */
export default function Clave() {
    const nueva = useRef<HTMLInputElement>(null);
    const actual = useRef<HTMLInputElement>(null);
    const form = useForm({ current_password: '', password: '', password_confirmation: '' });

    const guardar: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                sileo.success({ title: 'Clave cambiada', description: 'La próxima vez ingresa con la nueva.' });
            },
            onError: (errores) => {
                if (errores.password) {
                    form.reset('password', 'password_confirmation');
                    nueva.current?.focus();
                }
                if (errores.current_password) {
                    form.reset('current_password');
                    actual.current?.focus();
                }
            },
        });
    };

    return (
        <ConfiguracionLayout titulo="Mi clave">
            <form onSubmit={guardar} className={tarjeta}>
                <div className="flex items-center gap-4 border-b border-[#EEF2F9] px-6 py-5">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-[#EEF2FB] text-[#1E3A7B]">
                        <KeyRound className="size-6" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[20px] leading-7 font-semibold tracking-[-0.015em]">Cambiar mi clave</p>
                        <p className="mt-0.5 text-[14px] text-[#56627F]">
                            Usa al menos 8 caracteres y que no sea fácil de adivinar. Tu sesión aquí sigue abierta.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                    <div className="sm:col-span-2 sm:max-w-[calc(50%-8px)]">
                        <Campo id="current_password" etiqueta="Clave actual" error={form.errors.current_password}>
                            <CampoSecreto
                                id="current_password"
                                ref={actual}
                                value={form.data.current_password}
                                onChange={(e) => form.setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                aria-invalid={!!form.errors.current_password}
                            />
                        </Campo>
                    </div>
                    <Campo id="password" etiqueta="Clave nueva" error={form.errors.password}>
                        <CampoSecreto
                            id="password"
                            ref={nueva}
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!form.errors.password}
                        />
                    </Campo>
                    <Campo id="password_confirmation" etiqueta="Repite la clave nueva" error={form.errors.password_confirmation}>
                        <CampoSecreto
                            id="password_confirmation"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!form.errors.password_confirmation}
                        />
                    </Campo>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F9] px-6 py-3.5">
                    <span className="mr-auto text-[14px] text-[#56627F]">Te pedimos la actual para confirmar que eres tú.</span>
                    <BotonGuardar cargando={form.processing}>Cambiar clave</BotonGuardar>
                </div>
            </form>
        </ConfiguracionLayout>
    );
}
