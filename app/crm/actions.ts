'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ETAPAS } from '@/lib/formatos';

export type ResultadoMover = { ok: boolean };

// Chamada pelo kanban ao soltar um card em outra coluna
export async function moverEtapa(id: number, etapa: string): Promise<ResultadoMover> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  if (!Number.isInteger(id) || id <= 0 || !(etapa in ETAPAS)) return { ok: false };

  // O banco só permite ao usuário logado alterar "etapa" e "observacao"
  const { error } = await supabase.from('crm_oportunidades').update({ etapa }).eq('id', id);
  if (error) return { ok: false };

  revalidatePath('/crm');
  return { ok: true };
}
