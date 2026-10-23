import { Download, FileSpreadsheet, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export function ExportarInscritos() {
    const [descargando, setDescargando] = useState(false);

    const descargar = () => {
        setDescargando(true);
        const link = document.createElement('a');
        link.href = '/inscritos/excel/descargar';
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => setDescargando(false), 1000);
    };

    return (
        <button
            type="button"
            onClick={descargar}
            disabled={descargando}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-4 text-[14px] font-semibold text-[#3E4A68] transition hover:bg-[#F5F7FC] disabled:opacity-60 disabled:cursor-default"
            title={descargando ? 'Descargando...' : 'Descargar inscritos en Excel'}
        >
            {descargando ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : (
                <FileSpreadsheet className="size-4" />
            )}
            {descargando ? 'Descargando...' : 'Exportar a Excel'}
        </button>
    );
}
