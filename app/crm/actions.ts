'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ETAPAS, chaveValida } from '@/lib/formatos';

export type Resultado = { ok: boolean };

async function usuarioLogado() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

const idValido = (id: unknown): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0;

// Chamada pelo kanban ao soltar um card em outra coluna
export async function moverEtapa(id: number, etapa: string): Promise<Resultado> {
  const supabase = await usuarioLogado();
  if (!supabase || !idValido(id) || !chaveValida(ETAPAS, etapa)) return { ok: false };

  // O banco só permite ao usuário logado alterar etapa, observação e responsável
  const { error } = await supabase.from('crm_oportunidades').update({ etapa }).eq('id', id);
  if (error) return { ok: false };
  revalidatePath('/crm');
  return { ok: true };
}

// Define (ou remove, com null) o responsável pela oportunidade
export async function atribuirResponsavel(id: number, responsavelId: number | null): Promise<Resultado> {
  const supabase = await usuarioLogado();
  if (!supabase || !idValido(id) || (responsavelId !== null && !idValido(responsavelId))) return { ok: false };

  const { error } = await supabase.from('crm_oportunidades').update({ responsavel_id: responsavelId }).eq('id', id);
  if (error) return { ok: false };
  revalidatePath('/crm');
  return { ok: true };
}
