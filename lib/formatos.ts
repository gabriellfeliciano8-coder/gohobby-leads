export const STATUS: Record<string, string> = {
  crm: 'Enviado ao CRM',
  nutricao: 'Nutrição',
  duplicado: 'Duplicado',
  invalido: 'Inválido',
  erro: 'Erro',
};

export const CLASSIFICACOES: Record<string, string> = {
  quente: 'Quente',
  morno: 'Morno',
  frio: 'Frio',
};

export const ETAPAS: Record<string, string> = {
  novo: 'Novo',
  contato: 'Em contato',
  proposta: 'Proposta',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

const formatador = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function dataHora(iso: string) {
  return formatador.format(new Date(iso));
}

// Confere se a chave existe no próprio objeto (ignora propriedades herdadas como "constructor")
export function chaveValida<T extends object>(obj: T, chave: unknown): chave is keyof T & string {
  return typeof chave === 'string' && Object.hasOwn(obj, chave);
}
