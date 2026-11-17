'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icone from './Icone';
import { sair } from '@/app/login/actions';

type Props = { ativo: 'leads' | 'crm'; totalLeads: number; totalCrm: number; children: React.ReactNode };

const CHAVE = 'gohobby:menu-recolhido';

// Menu lateral que pode ser recolhido; a preferência fica salva neste navegador
export default function MenuLateral({ ativo, totalLeads, totalCrm, children }: Props) {
  const [recolhido, setRecolhido] = useState(false);

  useEffect(() => {
    try {
      setRecolhido(localStorage.getItem(CHAVE) === '1');
    } catch {
      /* armazenamento indisponível: segue expandido */
    }
  }, []);

  function alternar() {
    setRecolhido((r) => {
      try {
        localStorage.setItem(CHAVE, r ? '0' : '1');
      } catch {
        /* ignora */
      }
      return !r;
    });
  }

  const itens = [
    { id: 'leads', href: '/painel', rotulo: 'Leads', icone: 'lista' as const, total: totalLeads },
    { id: 'crm', href: '/crm', rotulo: 'CRM', icone: 'kanban' as const, total: totalCrm },
  ];

  return (
    <div className={`app${recolhido ? ' recolhido' : ''}`}>
      <nav className="menu" aria-label="Menu principal">
        <div className="menu-cabeca">
          <Link href="/painel" className="marca" aria-label="gohobby — painel">
            <span className="go">go</span>
            <span className="hobby">hobby</span>
          </Link>
          <Link href="/painel" className="marca-mini" aria-label="gohobby — painel">go</Link>
          <button
            type="button"
            className="recolher"
            onClick={alternar}
            aria-label={recolhido ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!recolhido}
            title={recolhido ? 'Expandir menu' : 'Recolher menu'}
          >
            <Icone nome={recolhido ? 'expandir' : 'recolher'} tamanho={18} cor="#d6d6db" />
          </button>
        </div>
        <div className="menu-grupo">
          <p className="menu-titulo">Comercial</p>
          {itens.map((i) => (
            <Link
              key={i.id}
              href={i.href}
              className={`menu-item${ativo === i.id ? ' ativo' : ''}`}
              aria-current={ativo === i.id ? 'page' : undefined}
              title={recolhido ? `${i.rotulo} (${i.total})` : undefined}
            >
              <Icone nome={i.icone} />
              <span className="menu-texto">{i.rotulo}</span>
              <span className="contagem">{i.total}</span>
            </Link>
          ))}
        </div>
        <div className="menu-usuario">
          <span className="avatar">GH</span>
          <div className="menu-texto">
            <p>gohobby</p>
            <small>Time comercial</small>
          </div>
          <form action={sair}>
            <button className="sair" type="submit" aria-label="Sair" title="Sair">
              <Icone nome="sair" tamanho={16} cor="#d6d6db" />
            </button>
          </form>
        </div>
      </nav>
      <main className="conteudo">{children}</main>
    </div>
  );
}
