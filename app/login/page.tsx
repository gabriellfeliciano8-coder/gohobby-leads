import Topo from '@/components/Topo';
import FormularioLogin from './FormularioLogin';

export const metadata = { title: 'GoHobby · Área restrita' };

export default async function Login({ searchParams }: { searchParams: Promise<{ negado?: string }> }) {
  const { negado } = await searchParams;

  return (
    <>
      <Topo />
      <main className="login-pagina">
        <div className="login-cartao">
          <h1>Área restrita</h1>
          <p>Acesso exclusivo ao time comercial.</p>
          {negado && (
            <div className="alerta falha" role="alert" style={{ marginBottom: 16 }}>
              <strong>Acesso negado</strong>
              Faça login para acessar esta página.
            </div>
          )}
          <FormularioLogin />
        </div>
      </main>
    </>
  );
}
