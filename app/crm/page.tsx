import Link from 'next/link';
import { redirect } from 'next/navigation';
import AreaRestrita from '@/components/AreaRestrita';
import { createClient } from '@/lib/supabase/server';
import Kanban, { type Oportunidade, type Pessoa } from './Kanban';

export const metadata = { title: 'GoHobby · CRM' };
export const dynamic = 'force-dynamic';

function iniciais(nome: string) {
  return nome.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default async function Crm({ searchParams }: { searchParams: Promise<{ resp?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?negado=1');

  const [{ data: dados, error }, { data: equipeDados }] = await Promise.all([
    supabase
      .from('crm_oportunidades')
      .select('id, created_at, updated_at, nome, email, telefone, empresa, cargo, classificacao, score, etapa, responsavel_id')
      .order('score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('equipe_comercial').select('id, nome, funcao, cor').eq('ativo', true).order('nome'),
  ]);

  const todas = (dados ?? []) as Oportunidade[];
  const equipe: Pessoa[] = (equipeDados ?? []).map((p) => ({
    ...p,
    iniciais: iniciais(p.nome),
    abertos: todas.filter((o) => o.responsavel_id === p.id && o.etapa !== 'ganho' && o.etapa !== 'perdido').length,
  }));

  const { resp } = await searchParams;
  const filtro = resp === 'sem' ? 'sem' : equipe.some((p) => String(p.id) === resp) ? Number(resp) : null;
  const visiveis = todas.filter((o) =>
    filtro === null ? true : filtro === 'sem' ? o.responsavel_id === null : o.responsavel_id === filtro,
  );
  const semResponsavel = todas.filter((o) => o.responsavel_id === null).length;

  return (
    <AreaRestrita ativo="crm">
      <header className="cabecalho">
        <div>
          <p className="sobretitulo">Oportunidades qualificadas</p>
          <h1>CRM</h1>
        </div>
        <nav className="filtro-pessoas" aria-label="Filtrar por responsável">
          <span>Responsável</span>
          <Link href="/crm" className={`chip-pessoa${filtro === null ? ' ativo' : ''}`} style={{ paddingLeft: 16 }} aria-current={filtro === null ? 'true' : undefined}>
            Todos · {todas.length}
          </Link>
          {equipe.map((p) => {
            const ativo = filtro === p.id;
            return (
              <Link key={p.id} href={ativo ? '/crm' : `/crm?resp=${p.id}`} className={`chip-pessoa${ativo ? ' ativo' : ''}`} aria-current={ativo ? 'true' : undefined}>
                <span className="avatar-pessoa" style={{ background: p.cor, color: p.cor === '#1D1D1F' ? '#BAE150' : p.cor === '#83B540' ? '#1D1D1F' : '#fff' }}>{p.iniciais}</span>
                {p.nome.split(' ')[0]}
              </Link>
            );
          })}
          <Link href={filtro === 'sem' ? '/crm' : '/crm?resp=sem'} className={`chip-pessoa sem${filtro === 'sem' ? ' ativo' : ''}`} aria-current={filtro === 'sem' ? 'true' : undefined}>
            Sem responsável · {semResponsavel}
          </Link>
        </nav>
      </header>

      {error ? (
        <div className="tabela-caixa"><div className="vazio">Não foi possível carregar o CRM.</div></div>
      ) : (
        <Kanban key={String(filtro)} iniciais={visiveis} equipe={equipe} />
      )}
    </AreaRestrita>
  );
}
