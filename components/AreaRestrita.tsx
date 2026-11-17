import Link from 'next/link';
import Marca from './Marca';
import Icone from './Icone';
import { sair } from '@/app/login/actions';
import { createClient } from '@/lib/supabase/server';

type Props = { ativo: 'leads' | 'crm'; children: React.ReactNode };

// Estrutura das páginas restritas: menu lateral escuro + conteúdo
export default async function AreaRestrita({ ativo, children }: Props) {
  const supabase = await createClient();
  const [{ count: totalLeads }, { count: totalCrm }] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('crm_oportunidades').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <div className="app">
      <nav className="menu" aria-label="Menu principal">
        <Marca href="/painel" />
        <div className="menu-grupo">
          <p className="menu-titulo">Comercial</p>
          <Link href="/painel" className={`menu-item${ativo === 'leads' ? ' ativo' : ''}`} aria-current={ativo === 'leads' ? 'page' : undefined}>
            <Icone nome="lista" />
            Leads
            <span className="contagem">{totalLeads ?? 0}</span>
          </Link>
          <Link href="/crm" className={`menu-item${ativo === 'crm' ? ' ativo' : ''}`} aria-current={ativo === 'crm' ? 'page' : undefined}>
            <Icone nome="kanban" />
            CRM
            <span className="contagem">{totalCrm ?? 0}</span>
          </Link>
        </div>
        <div className="menu-usuario">
          <span className="avatar">GH</span>
          <div>
            <p>gohobby</p>
            <small>Time comercial</small>
          </div>
          <form action={sair}>
            <button className="sair" type="submit" aria-label="Sair">
              <Icone nome="sair" tamanho={16} cor="#d6d6db" />
            </button>
          </form>
        </div>
      </nav>
      <main className="conteudo">{children}</main>
    </div>
  );
}
