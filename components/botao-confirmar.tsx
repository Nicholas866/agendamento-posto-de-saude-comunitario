"use client";

import type { ReactNode } from "react";

export function BotaoConfirmar({
  children,
  mensagem,
  className,
}: {
  children: ReactNode;
  mensagem: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(evento) => {
        if (!window.confirm(mensagem)) {
          evento.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
