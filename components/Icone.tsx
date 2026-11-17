// Ícones em traço (SVG inline), decorativos por padrão
const CAMINHOS: Record<string, React.ReactNode> = {
  cadeado: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  usuario: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  olho: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>),
  olhoFechado: (<><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>),
  seta: (<path d="M5 12h14M13 6l6 6-6 6" />),
  alerta: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>),
  ok: (<><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>),
  lista: (<path d="M3 5h18M3 12h18M3 19h12" />),
  kanban: (<><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="11" rx="1.5" /><rect x="17" y="4" width="4" height="7" rx="1.5" /></>),
  sair: (<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />),
  busca: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>),
  atualizar: (<><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>),
  fechar: (<path d="M6 6l12 12M18 6L6 18" />),
  mais: (<path d="M12 5v14M5 12h14" />),
  whatsapp: (<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" />),
  email: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
};

type Props = { nome: keyof typeof CAMINHOS; tamanho?: number; cor?: string; espessura?: number };

export default function Icone({ nome, tamanho = 18, cor = 'currentColor', espessura = 2 }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CAMINHOS[nome]}
    </svg>
  );
}
