import Link from 'next/link';
import Marca from '@/components/Marca';

export default function NaoEncontrado() {
  return (
    <div className="publica">
      <header className="publica-topo"><Marca /></header>
      <main className="publica-conteudo" style={{ justifyContent: 'center' }}>
        <section className="publica-texto" style={{ textAlign: 'center', flex: '0 1 560px' }}>
          <p className="sobretitulo">Erro 404</p>
          <h1>Página não <span>encontrada</span></h1>
          <p style={{ marginInline: 'auto' }}>O endereço acessado não existe.</p>
          <Link href="/" className="btn btn-lime">Voltar ao início</Link>
        </section>
      </main>
    </div>
  );
}
