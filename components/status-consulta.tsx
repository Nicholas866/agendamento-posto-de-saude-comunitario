import type { StatusConsulta } from "@/lib/tipos";

const ESTILOS: Record<
  StatusConsulta,
  { rotulo: string; classe: string }
> = {
  agendada: {
    rotulo: "Agendada",
    classe: "border-sky-300 bg-sky-100 text-sky-900",
  },
  confirmada: {
    rotulo: "Confirmada",
    classe: "border-green-300 bg-green-100 text-green-900",
  },
  cancelada: {
    rotulo: "Cancelada",
    classe: "border-gray-400 bg-gray-200 text-gray-800",
  },
  faltou: {
    rotulo: "Faltou",
    classe: "border-red-300 bg-red-100 text-red-900",
  },
  realizada: {
    rotulo: "Realizada",
    classe: "border-emerald-300 bg-emerald-100 text-emerald-900",
  },
};

export function StatusConsultaBadge({ status }: { status: StatusConsulta }) {
  const estilo = ESTILOS[status] ?? {
    rotulo: status,
    classe: "border-gray-400 bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`inline-block rounded-lg border-2 px-3 py-1 text-base font-bold ${estilo.classe}`}
    >
      {estilo.rotulo}
    </span>
  );
}
