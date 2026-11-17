'use client';

import { useRef, useState } from 'react';

type Estado =
  | { tipo: 'ocioso' }
  | { tipo: 'enviando' }
  | { tipo: 'sucesso'; mensagem: string }
  | { tipo: 'aviso'; mensagem: string }
  | { tipo: 'falha'; mensagem: string; erros?: string[] };

const CAMPOS = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text', autocomplete: 'name', max: 120 },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email', autocomplete: 'email', max: 254 },
  { nome: 'telefone', rotulo: 'DDD + Telefone', tipo: 'tel', autocomplete: 'tel', max: 30 },
  { nome: 'empresa', rotulo: 'Empresa', tipo: 'text', autocomplete: 'organization', max: 120 },
  { nome: 'cargo', rotulo: 'Cargo', tipo: 'text', autocomplete: 'organization-title', max: 80 },
] as const;

export default function FormularioLead() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'ocioso' });
  const formRef = useRef<HTMLFormElement>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado.tipo === 'enviando') return;
    setEstado({ tipo: 'enviando' });

    const dados = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      // A validação real é feita no fluxo (n8n); o formulário não bloqueia o envio
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const corpo = (await r.json().catch(() => ({}))) as { mensagem?: string; erros?: string[] };

      if (r.ok) {
        setEstado({ tipo: 'sucesso', mensagem: corpo.mensagem ?? 'Recebemos seus dados!' });
        formRef.current?.reset();
      } else if (r.status === 409) {
        setEstado({ tipo: 'aviso', mensagem: corpo.mensagem ?? 'Já recebemos um cadastro com este e-mail.' });
      } else {
        setEstado({
          tipo: 'falha',
          mensagem: corpo.mensagem ?? 'Não foi possível enviar. Tente novamente.',
          erros: corpo.erros,
        });
      }
    } catch {
      setEstado({ tipo: 'falha', mensagem: 'Sem conexão. Verifique sua internet e tente novamente.' });
    }
  }

  const enviando = estado.tipo === 'enviando';

  return (
    <form ref={formRef} className="form" onSubmit={enviar} noValidate aria-describedby="retorno">
      {CAMPOS.map((c) => (
        <div className="campo" key={c.nome}>
          <label htmlFor={c.nome}>{c.rotulo}</label>
          <input
            id={c.nome}
            name={c.nome}
            type={c.tipo}
            placeholder={c.rotulo}
            autoComplete={c.autocomplete}
            maxLength={c.max}
            disabled={enviando}
          />
        </div>
      ))}

      {/* Campo invisível anti-robô: pessoas não veem nem preenchem */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Site</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="botao" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar'}
      </button>

      <div id="retorno" aria-live="polite">
        {estado.tipo === 'sucesso' && (
          <div className="alerta sucesso" role="status">
            <strong>Envio concluído</strong>
            {estado.mensagem}
          </div>
        )}
        {estado.tipo === 'aviso' && (
          <div className="alerta aviso" role="status">
            <strong>Cadastro já existente</strong>
            {estado.mensagem}
          </div>
        )}
        {estado.tipo === 'falha' && (
          <div className="alerta falha" role="alert">
            <strong>Não foi possível enviar</strong>
            {estado.mensagem}
            {estado.erros && estado.erros.length > 0 && (
              <ul>
                {estado.erros.map((erro) => (
                  <li key={erro}>{erro}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="privacidade">
        Seus dados são usados apenas para retorno comercial. Este é um projeto acadêmico: utilize somente dados fictícios.
      </p>
    </form>
  );
}
