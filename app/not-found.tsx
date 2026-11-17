import Link from 'next/link';
import Topo from '@/components/Topo';

export default function NaoEncontrado() {
  return (
    <>
      <Topo />
      <main className="login-pagina">
        <div className="login-cartao">
          <h1>Página não encontrada</h1>
          <p>O endereço acessado não existe.</p>
          <Link href="/" className="botao" style={{ display: 'inline-block', lineHeight: '52px', textDecoration: 'none', textAlign: 'center' }}>
            Voltar ao início
          </Link>
        </div>
      </main>
    </>
  );
}
