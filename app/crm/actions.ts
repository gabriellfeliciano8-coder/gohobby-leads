'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ETAPAS } from '@/lib/formatos';

export async function moverEtapa(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?negado=1');

  const id = Number(formData.get('id'));
  const etapa = String(formData.get('etapa') ?? '');
  if (!Number.isInteger(id) || id <= 0 || !(etapa in ETAPAS)) return;

  // O banco só permite ao usuário logado alterar "etapa" e "observacao"
  await supabase.from('crm_oportunidades').update({ etapa }).eq('id', id);
  revalidatePath('/crm');
}
