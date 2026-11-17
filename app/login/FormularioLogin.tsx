'use client';

import { useActionState } from 'react';
import { entrar, type EstadoLogin } from './actions';

export default function FormularioLogin() {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={acao} className="form">
      <div className="campo">
        <label htmlFor="usuario">Usuário</label>
        <input id="usuario" name="usuario" placeholder="Usuário" autoComplete="username" required maxLength={60} />
      </div>
      <div className="campo">
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          placeholder="Senha"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </div>
      {estado.erro && (
        <div className="alerta falha" role="alert">
          {estado.erro}
        </div>
      )}
      <button className="botao" type="submit" disabled={pendente}>
        {pendente ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
