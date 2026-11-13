/** Remove tudo que não for dígito. */
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Exibe CPF (11 dígitos) ou Cartão SUS (15 dígitos) formatado. */
export function formatarCpfOuCartao(valor: string): string {
  const digitos = somenteDigitos(valor);

  if (digitos.length === 11) {
    return digitos.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  }

  if (digitos.length === 15) {
    return digitos.replace(
      /(\d{3})(\d{4})(\d{4})(\d{4})/,
      "$1 $2 $3 $4",
    );
  }

  return valor;
}

/** Exibe telefone com DDD, com ou sem o nono dígito. */
export function formatarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor);

  if (digitos.length === 11) {
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digitos.length === 10) {
    return digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return valor;
}

export const NOME_DO_CANAL: Record<string, string> = {
  email: "E-mail",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

const formatadorNumero = new Intl.NumberFormat("pt-BR");
const formatadorPorcentagem = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

/** Exibe 1.234. */
export function formatarNumero(valor: number): string {
  return formatadorNumero.format(valor);
}

/** Exibe 20% ou — quando não há base de cálculo. */
export function formatarPorcentagem(valor: number | null): string {
  if (valor === null) {
    return "—";
  }

  return `${formatadorPorcentagem.format(valor)}%`;
}
