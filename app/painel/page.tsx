import Link from 'next/link';
import { redirect } from 'next/navigation';
import Topo from '@/components/Topo';
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

export default async function Painel({ searchParams }: { searchParams: Promise<Filtros> }) {
  const supabase = await createClient();

  // Segunda barreira (além do proxy): sem usuário válido, não renderiza nada
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?negado=1');

  const { status, classificacao, q } = await searchParams;
  const statusValido = status && status in STATUS ? status : undefined;
  const classValida = classificacao && classificacao in CLASSIFICACOES ? classificacao : undefined;
  // Remove caracteres que alteram a sintaxe do filtro
  const busca = (q ?? '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 80);

  let consulta = supabase
    .from('leads')
    .select('id, created_at, nome, email, telefone, empresa, cargo, classificacao, score, metodo_classificacao, status, motivo')
    .order('created_at', { ascending: false })
    .limit(500);

  if (statusValido) consulta = consulta.eq('status', statusValido);
  if (classValida) consulta = consulta.eq('classificacao', classValida);
  if (busca) consulta = consulta.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,empresa.ilike.%${busca}%`);

  const [{ data: leads, error }, { data: resumo }] = await Promise.all([
    consulta,
    supabase.from('leads').select('status').limit(5000),
  ]);

  const contagem = (resumo ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = resumo?.length ?? 0;
  const filtrando = Boolean(statusValido || classValida || busca);

  return (
    <>
      <Topo area="painel" />
      <main className="restrita">
        <div className="restrita-conteudo">
          <div className="cabecalho-pagina">
            <div>
              <h1>Leads recebidos</h1>
              <p>Resultado de cada execução do fluxo de qualificação (n8n), em tempo real.</p>
            </div>
            <Link href="/painel" className="botao" style={{ height: 40, lineHeight: '40px', padding: '0 22px', fontSize: 14, textDecoration: 'none' }}>
              Atualizar
            </Link>
          </div>

          <div className="indicadores">
            <div className="indicador"><span>Total</span><strong>{total}</strong></div>
            <div className="indicador"><span>CRM</span><strong>{contagem.crm ?? 0}</strong></div>
            <div className="indicador"><span>Nutrição</span><strong>{contagem.nutricao ?? 0}</strong></div>
            <div className="indicador"><span>Duplicados</span><strong>{contagem.duplicado ?? 0}</strong></div>
            <div className="indicador"><span>Inválidos</span><strong>{contagem.invalido ?? 0}</strong></div>
            <div className="indicador"><span>Erros</span><strong>{contagem.erro ?? 0}</strong></div>
          </div>

          <form className="filtros" method="get">
            <input name="q" placeholder="Buscar nome, e-mail ou empresa" defaultValue={busca} maxLength={80} />
            <select name="status" defaultValue={statusValido ?? ''}>
              <option value="">Todos os status</option>
              {Object.entries(STATUS).map(([v, r]) => (
                <option key={v} value={v}>{r}</option>
              ))}
            </select>
            <select name="classificacao" defaultValue={classValida ?? ''}>
              <option value="">Todas as classificações</option>
              {Object.entries(CLASSIFICACOES).map(([v, r]) => (
                <option key={v} value={v}>{r}</option>
              ))}
            </select>
            <button className="botao" type="submit">Filtrar</button>
            {filtrando && <Link className="limpar" href="/painel">Limpar filtros</Link>}
          </form>

          <div className="tabela-caixa">
            {error ? (
              <div className="vazio">Não foi possível carregar os leads. Tente atualizar a página.</div>
            ) : !leads || leads.length === 0 ? (
              <div className="vazio">{filtrando ? 'Nenhum lead encontrado com esses filtros.' : 'Nenhum lead recebido ainda.'}</div>
            ) : (
              <table className="leads">
                <thead>
                  <tr>
                    <th>Data e hora</th>
                    <th>Lead</th>
                    <th>Empresa / Cargo</th>
                    <th>Classificação</th>
                    <th>Status final</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {(leads as Lead[]).map((l) => (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{dataHora(l.created_at)}</td>
                      <td>
                        <div className="principal">{l.nome || '—'}</div>
                        <div className="secundario">{l.email || '—'}</div>
                        <div className="secundario">{l.telefone || '—'}</div>
                      </td>
                      <td>
                        <div className="principal">{l.empresa || '—'}</div>
                        <div className="secundario">{l.cargo || '—'}</div>
                      </td>
                      <td>
                        {l.classificacao ? (
                          <>
                            <span className={`selo ${l.classificacao}`}>
                              {CLASSIFICACOES[l.classificacao] ?? l.classificacao}
                              {l.score !== null ? ` · ${l.score}` : ''}
                            </span>
                            {l.metodo_classificacao && (
                              <span className="metodo">
                                {l.metodo_classificacao === 'ia' ? 'por IA (Gemini)' : 'por regra fixa'}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="selo neutro">Não classificado</span>
                        )}
                      </td>
                      <td>
                        <span className={`selo ${l.status}`}>{STATUS[l.status] ?? l.status}</span>
                      </td>
                      <td className="motivo">{l.motivo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
