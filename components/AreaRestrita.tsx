import MenuLateral from './MenuLateral';
import { createClient } from '@/lib/supabase/server';

type Props = { ativo: 'leads' | 'crm'; children: React.ReactNode };

// Estrutura das páginas restritas: menu lateral (recolhível) + conteúdo
export default async function AreaRestrita({ ativo, children }: Props) {
  const supabase = await createClient();
  const [{ count: totalLeads }, { count: totalCrm }] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('crm_oportunidades').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <MenuLateral ativo={ativo} totalLeads={totalLeads ?? 0} totalCrm={totalCrm ?? 0}>
      {children}
    </MenuLateral>
  );
}
