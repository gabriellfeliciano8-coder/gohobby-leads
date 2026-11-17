import Link from 'next/link';
import { redirect } from 'next/navigation';
import AreaRestrita from '@/components/AreaRestrita';
import Icone from '@/components/Icone';
import { createClient } from '@/lib/supabase/server';
import { CLASSIFICACOES, STATUS, dataHora } from '@/lib/formatos';

export const metadata = { title: 'GoHobby · Leads recebidos' };
export const dynamic = 'force-dynamic';

type Lead = {
  id: number;
  created_at: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  cargo: string | null;
  classificacao: string | null;
  score: number | null;
  metodo_classificacao: string | null;
  status: string;
  motivo: string | null;
};

type Filtros = { status?: string; classificacao?: string; q?: string };

const COR_STATUS: Record<string, string> = {
  crm: '#83B540',
  nutricao: '#2EA3F2',
  duplicado: '#8a8a90',
  invalido: '#F2A900',
  erro: '#D93A2B',
};

// Monta a URL do painel mantendo os filtros atuais e trocando só o informado
function urlCom(atual: Filtros, mudanca: Partial<Filtros>) {
  const p = new URLSearchParams();
  const final = { ...atual, ...mudanca };
  (Object.keys(final) as (keyof Filtros)[]).forEach((k) => {
    const v = final[k];
    if (v) p.set(k, v);
  });
  const qs = p.toString();
  return qs ? `/painel?${qs}` : '/painel';
}

function iniciais(nome: string | null) {
  if (!nome) return '?';
  return nome.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default async function Painel({ searchParams }: { searchParams: Promise<Filtros> }) {
  const supabase = await createClient();

  // Segunda barreira (além do proxy): sem usuário válido, não renderiza nada
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?negado=1');

  const bruto = await searchParams;
  const filtros: Filtros = {
    status: bruto.status && bruto.status in STATUS ? bruto.status : undefined,
    classificacao: bruto.classificacao && bruto.classificacao in CLASSIFICACOES ? bruto.classificacao : undefined,
    // Remove caracteres que alteram a sintaxe do filtro
    q: (bruto.q ?? '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 80) || undefined,
  };

  let consulta = supabase
    .from('leads')
    .select('id, created_at, nome, email, telefone, empresa, cargo, classificacao, score, metodo_classificacao, status, motivo')
    .order('created_at', { ascending: false })
    .limit(500);
  if (filtros.status) consulta = consulta.eq('status', filtros.status);
  if (filtros.classificacao) consulta = consulta.eq('classificacao', filtros.classificacao);
  if (filtros.q) consulta = consulta.or(`nome.ilike.%${filtros.q}%,email.ilike.%${filtros.q}%,empresa.ilike.%${filtros.q}%`);

  const [{ data: leads, error }, { data: resumo }] = await Promise.all([
    consulta,
    supabase.from('leads').select('status, classificacao').limit(5000),
  ]);

  const porStatus: Record<string, number> = {};
  const porClasse: Record<string, number> = {};
  (resumo ?? []).forEach((l) => {
    porStatus[l.status] = (porStatus[l.status] ?? 0) + 1;
    if (l.classificacao) porClasse[l.classificacao] = (porClasse[l.classificacao] ?? 0) + 1;
  });
  const total = resumo?.length ?? 0;
  const lista = (leads ?? []) as Lead[];
  const filtrando = Boolean(filtros.status || filtros.classificacao || filtros.q);

  return (
    <AreaRestrita ativo="leads">
      <header className="cabecalho">
        <div>
          <p className="sobretitulo">Fluxo n8n · tempo real</p>
          <h1>Leads recebidos</h1>
        </div>
        <div className="acoes">
          <form className="busca" method="get" action="/painel" role="search">
            <Icone nome="busca" cor="#6b6b72" />
            <label htmlFor="q" className="sr-only">Buscar</label>
            <input id="q" name="q" type="search" placeholder="Buscar nome, e-mail ou empresa" defaultValue={filtros.q ?? ''} maxLength={80} />
            {filtros.status && <input type="hidden" name="status" value={filtros.status} />}
            {filtros.classificacao && <input type="hidden" name="classificacao" value={filtros.classificacao} />}
            <button className="btn btn-lime" type="submit">Buscar</button>
          </form>
          <Link href={urlCom(filtros, {})} className="btn btn-preto btn-sm">
            <Icone nome="atualizar" tamanho={16} cor="#BAE150" espessura={2.2} />
            Atualizar
          </Link>
        </div>
      </header>

      <nav className="kpis" aria-label="Filtrar por status final">
        <Link href={urlCom(filtros, { status: undefined })} className={`kpi${!filtros.status ? ' ativo' : ''}`} aria-current={!filtros.status ? 'true' : undefined}>
          <span className="kpi-topo"><span className="kpi-rotulo">Total</span><span className="kpi-ponto" style={{ background: !filtros.status ? '#BAE150' : '#1D1D1F' }} /></span>
          <strong>{total}</strong>
          <small>Todas as execuções</small>
        </Link>
        {Object.entries(STATUS).map(([valor, rotulo]) => {
          const ativo = filtros.status === valor;
          return (
            <Link
              key={valor}
              href={urlCom(filtros, { status: ativo ? undefined : valor })}
              className={`kpi${ativo ? ' ativo' : ''}`}
              aria-current={ativo ? 'true' : undefined}
            >
              <span className="kpi-topo"><span className="kpi-rotulo">{rotulo}</span><span className="kpi-ponto" style={{ background: COR_STATUS[valor] }} /></span>
              <strong>{porStatus[valor] ?? 0}</strong>
              <small>{ativo ? 'Clique para remover' : 'Clique para filtrar'}</small>
            </Link>
          );
        })}
      </nav>

      <div className="barra-filtros">
        <span className="info">Mostrando {lista.length} de {total} leads</span>
        {Object.entries(CLASSIFICACOES).map(([valor, rotulo]) => {
          const ativo = filtros.classificacao === valor;
          return (
            <Link
              key={valor}
              href={urlCom(filtros, { classificacao: ativo ? undefined : valor })}
              className={`chip chip-claro${ativo ? ' ativo' : ''}`}
              aria-current={ativo ? 'true' : undefined}
            >
              <span className="kpi-ponto" style={{ background: valor === 'quente' ? '#E8590C' : valor === 'morno' ? '#E0A100' : '#2EA3F2' }} />
              {rotulo} · {porClasse[valor] ?? 0}
            </Link>
          );
        })}
        {filtros.q && (
          <Link href={urlCom(filtros, { q: undefined })} className="chip">
            Busca: “{filtros.q}” <Icone nome="fechar" tamanho={14} cor="#BAE150" espessura={2.5} />
          </Link>
        )}
        {filtrando && (
          <Link href="/painel" className="chip">
            Limpar filtros <Icone nome="fechar" tamanho={14} cor="#BAE150" espessura={2.5} />
          </Link>
        )}
      </div>

      <section className="tabela-caixa" aria-label="Lista de leads">
        {error ? (
          <div className="vazio">Não foi possível carregar os leads. Tente atualizar a página.</div>
        ) : lista.length === 0 ? (
          <div className="vazio">{filtrando ? 'Nenhum lead encontrado com esses filtros.' : 'Nenhum lead recebido ainda. Envie um pelo formulário público.'}</div>
        ) : (
          <table className="leads">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Empresa · Cargo</th>
                <th>Classificação</th>
                <th>Status final</th>
                <th>Detalhe</th>
                <th>Recebido em</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="pessoa">
                      <span className={`avatar-lead ${l.classificacao ?? ''}`}>{iniciais(l.nome)}</span>
                      <div style={{ minWidth: 0 }}>
                        <p className="principal">{l.nome || '—'}</p>
                        <p className="secundario">{l.email || '—'}</p>
                        <p className="secundario">{l.telefone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="principal">{l.empresa || '—'}</p>
                    <p className="secundario">{l.cargo || '—'}</p>
                  </td>
                  <td>
                    {l.classificacao ? (
                      <>
                        <span className={`selo ${l.classificacao}`}>
                          {CLASSIFICACOES[l.classificacao] ?? l.classificacao}
                          {l.score !== null ? ` · ${l.score}` : ''}
                        </span>
                        {l.metodo_classificacao && (
                          <p className="metodo">{l.metodo_classificacao === 'ia' ? 'por IA (Gemini)' : 'por regra fixa'}</p>
                        )}
                      </>
                    ) : (
                      <span className="selo neutro">Não classificado</span>
                    )}
                  </td>
                  <td><span className={`selo ${l.status}`}>{STATUS[l.status] ?? l.status}</span></td>
                  <td className="motivo">{l.motivo || '—'}</td>
                  <td className="data">{dataHora(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AreaRestrita>
  );
}
