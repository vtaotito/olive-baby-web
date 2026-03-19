import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';

export function PublicTermsPage() {
  return (
    <>
      <SEOHead
        title="Termos de Uso"
        description="Leia os Termos de Uso da OlieCare. Conheça as condições para utilizar nossa plataforma de acompanhamento de rotina do bebê."
        canonical="/termos"
      />
      <div className="min-h-screen bg-sand-50">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <Link to="/" className="text-stone-600 hover:text-olive-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-olive-600" />
              <h1 className="font-display text-lg font-bold text-stone-800">Termos de Uso</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="prose prose-stone prose-lg max-w-none bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-stone-100">
            <p className="text-stone-500 text-sm">Última atualização: 11 de fevereiro de 2026</p>

            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou usar a plataforma OlieCare (oliecare.cloud), você concorda com estes 
              Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize a plataforma. 
              O uso continuado da plataforma constitui aceitação de quaisquer alterações futuras.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
              A OlieCare é uma plataforma web progressiva (PWA) que permite a pais, mães e cuidadores 
              acompanhar a rotina de seus bebês, incluindo:
            </p>
            <ul>
              <li>Registro de alimentação (amamentação, mamadeira, complemento alimentar).</li>
              <li>Acompanhamento de sono e sonecas.</li>
              <li>Controle de trocas de fraldas.</li>
              <li>Registro de banho e cuidados.</li>
              <li>Acompanhamento de crescimento (peso, altura, perímetro cefálico).</li>
              <li>Marcos de desenvolvimento.</li>
              <li>Insights e análises personalizadas com inteligência artificial.</li>
              <li>Compartilhamento com cuidadores e profissionais de saúde.</li>
            </ul>

            <h2>3. Cadastro e Conta</h2>
            <ul>
              <li>Você deve ter pelo menos 18 anos para criar uma conta.</li>
              <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
              <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
              <li>Cada pessoa deve ter apenas uma conta pessoal.</li>
              <li>Notifique-nos imediatamente sobre qualquer uso não autorizado da sua conta.</li>
            </ul>

            <h2>4. Planos e Pagamento</h2>
            <h3>4.1 Plano Gratuito</h3>
            <p>
              O plano gratuito inclui funcionalidades básicas: registro de alimentação, sono e fraldas 
              para até 1 bebê, com histórico dos últimos 7 dias e dashboard básico.
            </p>
            <h3>4.2 Plano Premium</h3>
            <p>
              O plano Premium (R$ 29,99/mês ou R$ 287,90/ano) oferece funcionalidades avançadas como 
              bebês ilimitados, histórico completo, gráficos avançados, insights com IA, calendário de 
              vacinas, exportação de dados e suporte prioritário.
            </p>
            <h3>4.3 Teste Grátis</h3>
            <p>
              Novos usuários têm direito a 7 dias de teste grátis do plano Premium. Ao término do período 
              de teste, a conta reverte automaticamente para o plano gratuito, a menos que uma assinatura 
              seja realizada.
            </p>

            <h2>5. Uso Aceitável</h2>
            <p>Ao utilizar a OlieCare, você se compromete a:</p>
            <ul>
              <li>Usar a plataforma apenas para os fins pretendidos (acompanhamento da rotina do bebê).</li>
              <li>Não utilizar a plataforma para fins comerciais não autorizados.</li>
              <li>Não tentar acessar dados de outros usuários sem autorização.</li>
              <li>Não interferir no funcionamento da plataforma ou de seus servidores.</li>
              <li>Não utilizar automação (bots, scrapers) sem autorização prévia.</li>
              <li>Não enviar conteúdo malicioso, ofensivo ou ilegal.</li>
            </ul>

            <h2>6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma OlieCare — incluindo design, textos, logotipos, ícones, 
              código-fonte e funcionalidades — é propriedade da OlieCare ou de seus licenciadores e é 
              protegido por leis de propriedade intelectual. É proibida a reprodução, distribuição ou 
              modificação sem autorização prévia.
            </p>

            <h2>7. Dados e Conteúdo do Usuário</h2>
            <ul>
              <li>Você mantém a propriedade sobre os dados que insere na plataforma.</li>
              <li>Ao utilizar a plataforma, você nos concede uma licença limitada para processar seus dados conforme necessário para fornecer os serviços.</li>
              <li>Você pode exportar ou excluir seus dados a qualquer momento (conforme disponibilidade do plano).</li>
              <li>Tratamos seus dados conforme nossa <Link to="/privacidade">Política de Privacidade</Link>.</li>
            </ul>

            <h2>8. Isenção de Responsabilidade Médica</h2>
            <p>
              <strong>A OlieCare não é um serviço médico.</strong> As informações, insights e sugestões 
              fornecidas pela plataforma são apenas informativas e não substituem consultas médicas 
              profissionais. Sempre consulte um pediatra ou profissional de saúde qualificado para 
              decisões sobre a saúde do seu bebê.
            </p>

            <h2>9. Limitação de Responsabilidade</h2>
            <p>
              A OlieCare é fornecida "como está". Não garantimos que o serviço será ininterrupto, 
              livre de erros ou completamente seguro. Na máxima extensão permitida por lei, a OlieCare 
              não será responsável por danos indiretos, incidentais, especiais ou consequenciais 
              resultantes do uso ou impossibilidade de uso da plataforma.
            </p>

            <h2>10. Cancelamento e Encerramento</h2>
            <ul>
              <li>Você pode cancelar sua conta a qualquer momento por meio das configurações da plataforma.</li>
              <li>Ao cancelar, seus dados serão retidos por 30 dias para possível recuperação, após o que serão permanentemente excluídos.</li>
              <li>Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos.</li>
            </ul>

            <h2>11. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes Termos de Uso a qualquer momento. Notificaremos sobre alterações 
              significativas por email ou por meio de aviso na plataforma. O uso continuado após as 
              alterações constitui aceitação dos novos termos.
            </p>

            <h2>12. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Eventuais 
              disputas serão submetidas ao foro da comarca da sede da empresa, com exclusão de qualquer 
              outro, por mais privilegiado que seja.
            </p>

            <h2>13. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos, entre em contato:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:contact@api.oliecare.cloud">contact@api.oliecare.cloud</a></li>
              <li><strong>Plataforma:</strong> <a href="https://oliecare.cloud">oliecare.cloud</a></li>
            </ul>
          </article>

          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-olive-600 hover:text-olive-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à página inicial
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
