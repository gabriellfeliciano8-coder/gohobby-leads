import Link from 'next/link';
import Marca from '@/components/Marca';
import Icone from '@/components/Icone';
import FormularioLogin from './FormularioLogin';

export const metadata = { title: 'GoHobby · Área comercial' };

export default async function Login({ searchParams }: { searchParams: Promise<{ negado?: string }> }) {
  const { negado } = await searchParams;

  return (
    <div className="login">
      <section className="login-hero">
        <span className="circulo c1" aria-hidden="true" />
        <span className="circulo c2" aria-hidden="true" />
        <span className="circulo c3" aria-hidden="true" />
        <Marca sub="Área comercial" />
        <div className="login-hero-texto">
          <p className="sobretitulo">Qualificação automática de leads</p>
          <h1>Cada lead no lugar certo, na hora certa.</h1>
          <p>Acompanhe em tempo real o que chegou pelo site, como cada lead foi classificado e o que aconteceu com ele no fluxo.</p>
        </div>
        <div className="mini-cards">
          <div className="mini-card"><p>Validação</p><strong>No servidor</strong></div>
          <div className="mini-card"><p>Classificação</p><strong>IA + regra fixa</strong></div>
          <div className="mini-card"><p>Falhas</p><strong>Retry + alerta</strong></div>
        </div>
      </section>

      <section className="login-lado">
        <div className="login-cartao">
          <div>
            <div className="login-icone"><Icone nome="cadeado" tamanho={24} cor="#BAE150" /></div>
            <h2>Entrar</h2>
            <p className="subtitulo">Acesso exclusivo ao time comercial.</p>
          </div>
          {negado && (
            <div className="alerta falha" role="alert">
              <Icone nome="alerta" cor="#A32014" />
              <div><strong>Acesso negado</strong>Faça login para acessar esta página.</div>
            </div>
          )}
          <FormularioLogin />
          <Link href="/" className="voltar">← Voltar ao formulário público</Link>
        </div>
      </section>
    </div>
  );
}
