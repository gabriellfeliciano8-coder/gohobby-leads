import { redirect } from 'next/navigation';
import Topo from '@/components/Topo';
import { createClient } from '@/lib/supabase/server';
import Kanban, { type Oportunidade } from './Kanban';

export const metadata = { title: 'GoHobby · CRM' };
export const dynamic = 'force-dynamic';

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

  return (
    <>
      <Topo area="crm" />
      <main className="restrita">
        <div className="restrita-conteudo">
          <div className="cabecalho-pagina">
            <div>
              <h1>CRM · Oportunidades</h1>
              <p>Leads qualificados (quentes e mornos) enviados pelo fluxo. Arraste os cards entre as etapas.</p>
            </div>
          </div>

          {error ? (
            <div className="tabela-caixa">
              <div className="vazio">Não foi possível carregar o CRM.</div>
            </div>
          ) : (
            <Kanban iniciais={(data ?? []) as Oportunidade[]} />
          )}
        </div>
      </main>
    </>
  );
}
