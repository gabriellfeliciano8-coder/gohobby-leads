'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type EstadoLogin = { erro?: string };

// Usuário de acesso definido no case
const USUARIO_PERMITIDO = 'gohobby';

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  // Aceita "gohobby" ou o e-mail completo "gohobby@<dominio>"
  const dominio = process.env.LOGIN_EMAIL_DOMAIN ?? 'exemplo.com';
  let usuario = String(formData.get('usuario') ?? '').trim().toLowerCase();
  if (usuario.endsWith(`@${dominio}`)) usuario = usuario.slice(0, -(dominio.length + 1));
  const senha = String(formData.get('senha') ?? '');

  // Mensagem genérica: não revela se o usuário ou a senha é que estão errados
  const erroGenerico = { erro: 'Usuário ou senha inválidos.' };

  if (usuario !== USUARIO_PERMITIDO || !senha || senha.length > 200) return erroGenerico;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: `${usuario}@${dominio}`,
    password: senha,
  });

  if (error) {
    // Supabase já aplica limite de tentativas de login por IP
    return error.status === 429 ? { erro: 'Muitas tentativas. Aguarde alguns minutos.' } : erroGenerico;
  }

  redirect('/painel');
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
