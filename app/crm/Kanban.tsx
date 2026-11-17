'use client';

import { useState, useTransition } from 'react';
import { CLASSIFICACOES, ETAPAS, dataHora } from '@/lib/formatos';
import { moverEtapa } from './actions';

export type Oportunidade = {
  id: number;
  created_at: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  cargo: string | null;
  classificacao: string | null;
  score: number | null;
  etapa: string;
};

export default function Kanban({ iniciais }: { iniciais: Oportunidade[] }) {
  const [cards, setCards] = useState(iniciais);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  function mover(id: number, etapa: string) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.etapa === etapa) return;
    const anterior = card.etapa;

    // Atualiza na tela na hora; desfaz se o banco recusar
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, etapa } : c)));
    setErro(null);
    iniciar(async () => {
      const r = await moverEtapa(id, etapa);
      if (!r.ok) {
        setCards((cs) => cs.map((c) => (c.id === id ? { ...c, etapa: anterior } : c)));
        setErro('Não foi possível mover o card. Tente novamente.');
      }
    });
  }

  return (
    <>
      {erro && (
        <div className="alerta falha" role="alert" style={{ marginBottom: 14 }}>
          {erro}
        </div>
      )}
      <div className="kanban">
        {Object.entries(ETAPAS).map(([etapa, rotulo]) => {
          const daColuna = cards.filter((c) => c.etapa === etapa);
          return (
            <section
              key={etapa}
              className={`coluna coluna-${etapa}${alvo === etapa ? ' alvo' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (alvo !== etapa) setAlvo(etapa);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setAlvo(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData('text/plain'));
                setAlvo(null);
                setArrastando(null);
                if (id) mover(id, etapa);
              }}
            >
              <h2>
                {rotulo} <span className="contador">{daColuna.length}</span>
              </h2>

              {daColuna.length === 0 && <div className="coluna-vazia">Arraste um card para cá</div>}

              {daColuna.map((o) => (
                <article
                  key={o.id}
                  className={`cartao${arrastando === o.id ? ' arrastando' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(o.id));
                    e.dataTransfer.effectAllowed = 'move';
                    setArrastando(o.id);
                  }}
                  onDragEnd={() => {
                    setArrastando(null);
                    setAlvo(null);
                  }}
                >
                  <div className="cartao-topo">
                    <h3>{o.nome}</h3>
                    {o.classificacao && (
                      <span className={`selo ${o.classificacao}`}>
                        {CLASSIFICACOES[o.classificacao]}
                        {o.score !== null ? ` · ${o.score}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="cartao-empresa">{o.empresa || '—'}</p>
                  <p>{o.cargo || '—'}</p>
                  <p className="cartao-contato">{o.email}</p>
                  <p className="cartao-contato">{o.telefone || '—'}</p>
                  <div className="cartao-rodape">
                    <span>{dataHora(o.created_at)}</span>
                    {/* Alternativa ao arrastar (teclado e celular) */}
                    <select
                      value={o.etapa}
                      onChange={(e) => mover(o.id, e.target.value)}
                      aria-label={`Mover ${o.nome} para outra etapa`}
                    >
                      {Object.entries(ETAPAS).map(([v, r]) => (
                        <option key={v} value={v}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
