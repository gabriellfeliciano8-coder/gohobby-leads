import Link from 'next/link';
import { sair } from '@/app/login/actions';

type Props = { area?: 'publica' | 'painel' | 'crm' };

export default function Topo({ area = 'publica' }: Props) {
  return (
    <header className="topo">
      <Link href="/" className="marca">
        <strong>gohobby</strong>
        <span>{area === 'publica' ? 'Fale com um especialista' : 'Área comercial'}</span>
      </Link>
      {area === 'publica' ? (
        <nav>
          <Link href="/login">Área restrita</Link>
        </nav>
      ) : (
        <nav>
          <Link href="/painel" className={area === 'painel' ? 'ativo' : ''}>
            Leads
          </Link>
          <Link href="/crm" className={area === 'crm' ? 'ativo' : ''}>
            CRM
          </Link>
          <form action={sair}>
            <button className="sair" type="submit">
              Sair
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
