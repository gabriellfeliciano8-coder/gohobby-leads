'use client';

import { useActionState, useState } from 'react';
import { entrar, type EstadoLogin } from './actions';
import Icone from '@/components/Icone';

export default function FormularioLogin() {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [mostrar, setMostrar] = useState(false);

  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="campo">
        <label htmlFor="usuario">Usuário</label>
        <div className="entrada">
          <Icone nome="usuario" cor="#8a8a90" />
          <input id="usuario" name="usuario" placeholder="gohobby" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={60} />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="senha">Senha</label>
        <div className="entrada">
          <Icone nome="cadeado" cor="#8a8a90" />
          <input
            id="senha"
            name="senha"
            type={mostrar ? 'text' : 'password'}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
            maxLength={200}
          />
          <button
            type="button"
            className="icone-btn"
            onClick={() => setMostrar((m) => !m)}
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={mostrar}
          >
            <Icone nome={mostrar ? 'olhoFechado' : 'olho'} cor="#3a3a3f" />
          </button>
        </div>
      </div>
      {estado.erro && (
        <div className="alerta falha" role="alert">
          <Icone nome="alerta" cor="#A32014" />
          <div>{estado.erro}</div>
        </div>
      )}
      <button className="btn btn-lime" type="submit" disabled={pendente}>
        {pendente ? 'Entrando…' : 'Entrar no painel'}
        {!pendente && <Icone nome="seta" cor="#1D1D1F" espessura={2.5} />}
      </button>
    </form>
  );
}
