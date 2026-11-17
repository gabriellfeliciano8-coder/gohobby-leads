'use client';

import { useRef, useState } from 'react';
import Icone from './Icone';

type Estado =
  | { tipo: 'ocioso' }
  | { tipo: 'enviando' }
  | { tipo: 'sucesso'; mensagem: string }
  | { tipo: 'aviso'; mensagem: string }
  | { tipo: 'falha'; mensagem: string; erros?: string[] };

const CAMPOS = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text', dica: 'Seu nome completo', autocomplete: 'name', max: 120, inteira: true },
  { nome: 'email', rotulo: 'E-mail corporativo', tipo: 'email', dica: 'voce@empresa.com.br', autocomplete: 'email', max: 254, inteira: false },
  { nome: 'telefone', rotulo: 'Telefone com DDD', tipo: 'tel', dica: '(11) 99999-9999', autocomplete: 'tel', max: 30, inteira: false },
  { nome: 'empresa', rotulo: 'Empresa', tipo: 'text', dica: 'Nome da empresa', autocomplete: 'organization', max: 120, inteira: false },
  { nome: 'cargo', rotulo: 'Cargo', tipo: 'text', dica: 'Seu cargo', autocomplete: 'organization-title', max: 80, inteira: false },
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
        setEstado({ tipo: 'falha', mensagem: corpo.mensagem ?? 'Não foi possível enviar. Tente novamente.', erros: corpo.erros });
      }
    } catch {
      setEstado({ tipo: 'falha', mensagem: 'Sem conexão. Verifique sua internet e tente novamente.' });
    }
  }

  const enviando = estado.tipo === 'enviando';

  return (
    <form ref={formRef} className="form-lead" onSubmit={enviar} noValidate aria-describedby="retorno">
      <h2>Seus dados</h2>

      <div className="form-grade">
        {CAMPOS.map((c) => (
          <div className={`campo${c.inteira ? ' inteira' : ''}`} key={c.nome}>
            <label htmlFor={c.nome}>{c.rotulo}</label>
            <div className="entrada">
              <input
                id={c.nome}
                name={c.nome}
                type={c.tipo}
                placeholder={c.dica}
                autoComplete={c.autocomplete}
                maxLength={c.max}
                disabled={enviando}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Campo invisível anti-robô: pessoas não veem nem preenchem */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Site</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="btn btn-lime" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Quero falar com um especialista'}
        {!enviando && <Icone nome="seta" cor="#1D1D1F" espessura={2.5} />}
      </button>

      <div id="retorno" aria-live="polite">
        {estado.tipo === 'sucesso' && (
          <div className="alerta sucesso" role="status">
            <Icone nome="ok" tamanho={20} cor="#3D6312" espessura={2.2} />
            <div><strong>Recebemos seus dados!</strong>{estado.mensagem.replace('Recebemos seus dados! ', '')}</div>
          </div>
        )}
        {estado.tipo === 'aviso' && (
          <div className="alerta aviso" role="status">
            <Icone nome="alerta" tamanho={20} cor="#7A4E00" espessura={2.2} />
            <div><strong>Cadastro já existente</strong>{estado.mensagem}</div>
          </div>
        )}
        {estado.tipo === 'falha' && (
          <div className="alerta falha" role="alert">
            <Icone nome="alerta" tamanho={20} cor="#A32014" espessura={2.2} />
            <div>
              <strong>Não foi possível enviar</strong>
              {estado.mensagem}
              {estado.erros && estado.erros.length > 0 && (
                <ul>{estado.erros.map((erro) => <li key={erro}>{erro}</li>)}</ul>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="nota">Seus dados são usados apenas para retorno comercial. Projeto acadêmico: utilize somente dados fictícios.</p>
    </form>
  );
}
