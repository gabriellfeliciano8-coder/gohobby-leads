import Link from 'next/link';
import Marca from '@/components/Marca';
import Icone from '@/components/Icone';
import FormularioLead from '@/components/FormularioLead';

export default function Home() {
  return (
    <div className="publica">
      <header className="publica-topo">
        <Marca />
        <Link href="/login" className="btn btn-contorno btn-sm">
          <Icone nome="cadeado" tamanho={14} cor="#BAE150" espessura={2.2} />
          Área restrita
        </Link>
      </header>

      <main className="publica-conteudo">
        <section className="publica-texto">
          <p className="sobretitulo">Atendimento para empresas</p>
          <h1>
            Fale com um <span>especialista</span>
          </h1>
          <p>Conte quem você é e onde trabalha. Um consultor entra em contato para entender o projeto da sua empresa.</p>
          <div className="mini-cards">
            <div className="mini-card"><p>Agricultura</p><strong>de precisão</strong></div>
            <div className="mini-card"><p>Inspeção</p><strong>e segurança</strong></div>
            <div className="mini-card"><p>Mapeamento</p><strong>e delivery</strong></div>
          </div>
        </section>
        <FormularioLead />
      </main>
    </div>
  );
}
