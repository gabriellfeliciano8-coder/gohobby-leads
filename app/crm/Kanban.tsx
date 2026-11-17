'use client';

import { useEffect, useState, useTransition } from 'react';
import Icone from '@/components/Icone';
import { CLASSIFICACOES, ETAPAS } from '@/lib/formatos';
import { atribuirResponsavel, moverEtapa } from './actions';

export type Oportunidade = {
  id: number;
  created_at: string;
  updated_at: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  cargo: string | null;
  classificacao: string | null;
  score: number | null;
  etapa: string;
  responsavel_id: number | null;
};

export type Pessoa = { id: number; nome: string; funcao: string; cor: string; iniciais: string; abertos: number };

const COR_ETAPA: Record<string, string> = {
  novo: '#2EA3F2',
  contato: '#F2A900',
  proposta: '#8E6CC2',
  ganho: '#83B540',
  perdido: '#D93A2B',
};

// Texto legível sobre a cor do avatar
const corTexto = (fundo: string) => (fundo === '#1D1D1F' ? '#BAE150' : fundo === '#83B540' ? '#1D1D1F' : '#FFFFFF');

function tempoDesde(iso: string) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} dia${d > 1 ? 's' : ''}`;
}

export default function Kanban({ iniciais, equipe }: { iniciais: Oportunidade[]; equipe: Pessoa[] }) {
  const [cards, setCards] = useState(iniciais);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  // Fecha o menu de atribuição ao clicar fora ou apertar Esc
  useEffect(() => {
    if (menuAberto === null) return;
    const fechar = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof MouseEvent && (e.target as HTMLElement).closest('[data-menu-atribuir]')) return;
      setMenuAberto(null);
    };
    document.addEventListener('mousedown', fechar);
    document.addEventListener('keydown', fechar);
    return () => {
      document.removeEventListener('mousedown', fechar);
      document.removeEventListener('keydown', fechar);
    };
  }, [menuAberto]);

  // Atualiza na tela na hora; desfaz se o banco recusar
  function atualizar(id: number, mudanca: Partial<Oportunidade>, salvar: () => Promise<{ ok: boolean }>, falha: string) {
    const anterior = cards.find((c) => c.id === id);
    if (!anterior) return;
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...mudanca } : c)));
    setErro(null);
    iniciar(async () => {
      const r = await salvar();
      if (!r.ok) {
        setCards((cs) => cs.map((c) => (c.id === id ? anterior : c)));
        setErro(falha);
      }
    });
  }

  function mover(id: number, etapa: string) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.etapa === etapa) return;
    atualizar(id, { etapa }, () => moverEtapa(id, etapa), 'Não foi possível mover o card. Tente novamente.');
  }

  function atribuir(id: number, responsavelId: number | null) {
    setMenuAberto(null);
    atualizar(id, { responsavel_id: responsavelId }, () => atribuirResponsavel(id, responsavelId), 'Não foi possível atribuir o responsável.');
  }

  return (
    <>
      {erro && (
        <div className="alerta falha" role="alert">
          <Icone nome="alerta" cor="#A32014" />
          <div>{erro}</div>
        </div>
      )}
      <div className="kanban-rolagem">
        <div className="kanban">
          {Object.entries(ETAPAS).map(([etapa, rotulo]) => {
            const daColuna = cards.filter((c) => c.etapa === etapa);
            return (
              <section
                key={etapa}
                aria-label={rotulo}
                className={`coluna${alvo === etapa ? ' alvo' : ''}`}
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
                <div className="coluna-topo">
                  <span className="ponto" style={{ background: COR_ETAPA[etapa] }} />
                  <h2>{rotulo}</h2>
                  <span className="contador">{daColuna.length}</span>
                </div>

                {daColuna.length === 0 && <div className="coluna-vazia">Arraste um card para cá</div>}

                {daColuna.map((o) => {
                  const resp = equipe.find((p) => p.id === o.responsavel_id) ?? null;
                  const tel = (o.telefone ?? '').replace(/\D/g, '');
                  return (
                    <article
                      key={o.id}
                      className={`cartao${arrastando === o.id ? ' arrastando' : ''}`}
                      draggable={menuAberto !== o.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(o.id));
                        e.dataTransfer.effectAllowed = 'move';
                        setArrastando(o.id);
                      }}
                      onDragEnd={() => {
                        setArrastando(null);
                        setAlvo(null);
                      }}
                      style={menuAberto === o.id ? { zIndex: 30 } : undefined}
                    >
                      <div className="cartao-topo">
                        <h3>{o.nome}</h3>
                        {o.classificacao && (
                          <span className={`selo ${o.classificacao}`}>
                            {CLASSIFICACOES[o.classificacao]}{o.score !== null ? ` · ${o.score}` : ''}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="cartao-empresa">{o.empresa || '—'}</p>
                        <p className="cartao-cargo">{o.cargo || '—'}</p>
                      </div>
                      <div className="etiquetas">
                        <span className="etiqueta">{tempoDesde(o.created_at)}</span>
                        <label className="sr-only" htmlFor={`etapa-${o.id}`}>Mover {o.nome} para</label>
                        {/* Alternativa ao arrastar (teclado e celular) */}
                        <select
                          id={`etapa-${o.id}`}
                          className="etiqueta"
                          value={o.etapa}
                          onChange={(e) => mover(o.id, e.target.value)}
                          style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: 11, fontWeight: 600 }}
                        >
                          {Object.entries(ETAPAS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
                        </select>
                      </div>

                      <div className="cartao-rodape" data-menu-atribuir>
                        <button
                          type="button"
                          className={`responsavel-btn${resp ? '' : ' vazio'}`}
                          aria-haspopup="menu"
                          aria-expanded={menuAberto === o.id}
                          onClick={() => setMenuAberto(menuAberto === o.id ? null : o.id)}
                        >
                          {resp ? (
                            <>
                              <span className="avatar-pessoa" style={{ background: resp.cor, color: corTexto(resp.cor) }}>{resp.iniciais}</span>
                              {resp.nome}
                            </>
                          ) : (
                            <>
                              <Icone nome="mais" tamanho={14} cor="#3D6312" espessura={2.4} />
                              Atribuir responsável
                            </>
                          )}
                        </button>
                        <div className="atalhos">
                          {tel && (
                            <a className="atalho" href={`https://wa.me/55${tel}`} target="_blank" rel="noopener noreferrer" aria-label={`Chamar ${o.nome} no WhatsApp`}>
                              <Icone nome="whatsapp" tamanho={16} cor="#3a3a3f" />
                            </a>
                          )}
                          <a className="atalho" href={`mailto:${o.email}`} aria-label={`Enviar e-mail para ${o.nome}`}>
                            <Icone nome="email" tamanho={16} cor="#3a3a3f" />
                          </a>
                        </div>

                        {menuAberto === o.id && (
                          <div className="menu-atribuir" role="menu" aria-label="Escolher responsável">
                            <p>Atribuir a</p>
                            {equipe.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                role="menuitemradio"
                                aria-checked={o.responsavel_id === p.id}
                                className={o.responsavel_id === p.id ? 'atual' : ''}
                                onClick={() => atribuir(o.id, p.id)}
                              >
                                <span className="avatar-pessoa" style={{ width: 32, height: 32, background: p.cor, color: corTexto(p.cor) }}>{p.iniciais}</span>
                                <span>
                                  <span className="nome">{p.nome}</span>
                                  <span className="funcao">{p.funcao} · {p.abertos} em aberto</span>
                                </span>
                              </button>
                            ))}
                            {resp && (
                              <button type="button" role="menuitem" onClick={() => atribuir(o.id, null)}>
                                <span className="avatar-pessoa" style={{ width: 32, height: 32, background: '#2a2a2e', color: '#b4b4ba' }}>
                                  <Icone nome="fechar" tamanho={14} />
                                </span>
                                <span><span className="nome">Remover responsável</span></span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
