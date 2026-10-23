import { FileSpreadsheet } from 'lucide-react';

export function ExportarInscritos() {
    return (
        <a
            href="/inscritos/excel/descargar"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border-[1.5px] border-[#D3DDF3] bg-white px-4 text-[14px] font-semibold text-[#3E4A68] transition hover:bg-[#F5F7FC]"
            title="Descargar inscritos en Excel"
        >
            <FileSpreadsheet className="size-4" />
            Exportar a Excel
        </a>
    );
}

