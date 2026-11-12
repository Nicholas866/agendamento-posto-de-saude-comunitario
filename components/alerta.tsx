type TipoAlerta = "sucesso" | "erro" | "aviso";

const ESTILOS: Record<TipoAlerta, string> = {
  sucesso: "border-green-300 bg-green-50 text-green-900",
  erro: "border-red-300 bg-red-50 text-red-900",
  aviso: "border-amber-300 bg-amber-50 text-amber-900",
};

const ICONES: Record<TipoAlerta, string> = {
  sucesso: "✓",
  erro: "!",
  aviso: "!",
};

export function Alerta({
  tipo,
  children,
}: {
  tipo: TipoAlerta;
  children: React.ReactNode;
}) {
  return (
    <p
      role={tipo === "erro" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-lg font-semibold ${ESTILOS[tipo]}`}
    >
      <span aria-hidden="true">{ICONES[tipo]}</span>
      <span>{children}</span>
    </p>
  );
}
