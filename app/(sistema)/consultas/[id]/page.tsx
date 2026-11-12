import Link from "next/link";
import { notFound } from "next/navigation";

import { Alerta } from "@/components/alerta";
import { StatusConsultaBadge } from "@/components/status-consulta";
import { exigirPerfil } from "@/lib/auth";
import { dataSP, formatarDataHora, formatarHora } from "@/lib/datahora";
import { buscarConsultaDetalhe } from "@/lib/dados/consultas";
import { formatarCpfOuCartao, formatarTelefone } from "@/lib/formatacao";
import {
  mensagemErroConsulta,
  mensagemSucessoConsulta,
} from "@/lib/mensagens-consulta";
import { UUID_REGEX } from "@/lib/tipos";

import { AcoesConsulta } from "../acoes-consulta";

export default async function ConsultaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}) {
  const perfil = await exigirPerfil();
  const [{ id }, parametros] = await Promise.all([params, searchParams]);

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const consulta = await buscarConsultaDetalhe(id);

  if (!consulta) {
    notFound();
  }

  const podeGerenciar =
    perfil.papel === "recepcao" || perfil.papel === "admin";
  const podeVerContato = podeGerenciar;
  const diaDaConsulta = dataSP(consulta.horario.inicio);

  const mensagemSucesso = mensagemSucessoConsulta(parametros.sucesso);
  const mensagemErro = mensagemErroConsulta(parametros.erro);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/agenda?data=${diaDaConsulta}`}
          className="text-lg font-semibold text-sky-900 underline"
        >
          ← Voltar para a agenda
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Detalhe da consulta
          </h1>
          <StatusConsultaBadge status={consulta.status} />
        </div>
      </div>

      {mensagemSucesso ? (
        <Alerta tipo="sucesso">{mensagemSucesso}</Alerta>
      ) : null}
      {mensagemErro ? <Alerta tipo="erro">{mensagemErro}</Alerta> : null}

      <section className="space-y-6 rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paciente</h2>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {consulta.paciente.nome}
          </p>

          {podeVerContato ? (
            <dl className="mt-3 space-y-1 text-lg text-gray-800">
              <div>
                <dt className="inline font-semibold">CPF/Cartão SUS: </dt>
                <dd className="inline">
                  {formatarCpfOuCartao(consulta.paciente.cpf_ou_cartao_sus)}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Telefone: </dt>
                <dd className="inline">
                  {formatarTelefone(consulta.paciente.telefone)}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">E-mail: </dt>
                <dd className="inline">
                  {consulta.paciente.email ?? "não informado"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-base text-gray-600">
              Os dados de contato ficam visíveis apenas para a recepção e a
              administração.
            </p>
          )}
        </div>

        <div className="border-t-2 border-gray-100 pt-6">
          <h2 className="text-2xl font-bold text-gray-900">Horário</h2>
          <dl className="mt-3 space-y-1 text-lg text-gray-800">
            <div>
              <dt className="inline font-semibold">Data e hora: </dt>
              <dd className="inline">
                {formatarDataHora(consulta.horario.inicio)} até{" "}
                {formatarHora(consulta.horario.fim)}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Profissional: </dt>
              <dd className="inline">{consulta.horario.profissional_nome}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Especialidade: </dt>
              <dd className="inline">
                {consulta.horario.especialidade || "não informada"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900">Ações</h2>

        {podeGerenciar ? (
          <AcoesConsulta
            consulta={{
              id: consulta.id,
              status: consulta.status,
              inicio: consulta.horario.inicio,
            }}
            podeGerenciar={podeGerenciar}
            origem="detalhe"
            mostrarVazio
          />
        ) : (
          <p className="text-lg text-gray-700">
            Seu perfil pode consultar os dados, mas apenas a recepção e a
            administração podem alterar a consulta.
          </p>
        )}
      </section>

      <p className="text-base text-gray-600">
        Registrada em {formatarDataHora(consulta.criado_em)}.
        {consulta.atualizado_em !== consulta.criado_em
          ? ` Última alteração em ${formatarDataHora(consulta.atualizado_em)}.`
          : null}
      </p>
    </div>
  );
}
