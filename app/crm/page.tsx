import { redirect } from 'next/navigation';
import Topo from '@/components/Topo';
import { createClient } from '@/lib/supabase/server';
import { CLASSIFICACOES, ETAPAS, dataHora } from '@/lib/formatos';
import { moverEtapa } from './actions';

export const metadata = { title: 'GoHobby · CRM' };
export const dynamic = 'force-dynamic';

type Oportunidade = {
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

export default async function Crm() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?negado=1');

  const { data, error } = await supabase
    .from('crm_oportunidades')
    .select('id, created_at, nome, email, telefone, empresa, cargo, classificacao, score, etapa')
    .order('score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(500);

  const oportunidades = (data ?? []) as Oportunidade[];

  return (
    <>
      <Topo area="crm" />
      <main className="restrita">
        <div className="restrita-conteudo">
          <div className="cabecalho-pagina">
            <div>
              <h1>CRM · Oportunidades</h1>
              <p>Leads qualificados (quentes e mornos) enviados pelo fluxo. Mova o card para acompanhar a negociação.</p>
            </div>
          </div>

          {error ? (
            <div className="tabela-caixa"><div className="vazio">Não foi possível carregar o CRM.</div></div>
          ) : (
            <div className="kanban">
              {Object.entries(ETAPAS).map(([etapa, rotulo]) => {
                const cards = oportunidades.filter((o) => o.etapa === etapa);
                return (
                  <section className="coluna" key={etapa}>
                    <h2>
                      {rotulo} <span>{cards.length}</span>
                    </h2>
                    {cards.map((o) => (
                      <article className="cartao" key={o.id}>
                        <h3>{o.nome}</h3>
                        <p>{o.empresa || '—'}</p>
                        <p>{o.cargo || '—'}</p>
                        <p>{o.email}</p>
                        <p>{o.telefone || '—'}</p>
                        <p style={{ marginTop: 6 }}>{dataHora(o.created_at)}</p>
                        <div className="linha">
                          {o.classificacao && (
                            <span className={`selo ${o.classificacao}`}>
                              {CLASSIFICACOES[o.classificacao]}{o.score !== null ? ` · ${o.score}` : ''}
                            </span>
                          )}
                        </div>
                        <form action={moverEtapa} className="linha">
                          <input type="hidden" name="id" value={o.id} />
                          <select name="etapa" defaultValue={o.etapa} aria-label="Mover para etapa">
                            {Object.entries(ETAPAS).map(([v, r]) => (
                              <option key={v} value={v}>{r}</option>
                            ))}
                          </select>
                          <button type="submit">Mover</button>
                        </form>
                      </article>
                    ))}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
