import Topo from '@/components/Topo';
import FormularioLead from '@/components/FormularioLead';

export default function Home() {
  return (
    <>
      <Topo />
      <main className="conteudo">
        <section>
          <h1 className="titulo">Fale com um especialista</h1>
          <p className="intro">
            Preencha seus dados e um consultor entrará em contato para entender a necessidade da sua empresa.
          </p>
          <ul className="beneficios">
            <li>Atendimento consultivo para empresas.</li>
            <li>Indicação da solução mais adequada ao seu projeto.</li>
            <li>Retorno do time comercial pelo telefone ou e-mail informado.</li>
          </ul>
        </section>
        <section>
          <FormularioLead />
        </section>
      </main>
      <footer className="rodape">
        Case prático de automação e IA · Projeto acadêmico em parceria com a GoHobby · Utilize apenas dados fictícios.
      </footer>
    </>
  );
}
