import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';

export function PublicPrivacyPage() {
  return (
    <>
      <SEOHead
        title="Política de Privacidade"
        description="Conheça a Política de Privacidade da OlieCare. Saiba como coletamos, usamos e protegemos seus dados e os dados do seu bebê."
        canonical="/privacidade"
      />
      <div className="min-h-screen bg-sand-50">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <Link to="/" className="text-stone-600 hover:text-olive-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-olive-600" />
              <h1 className="font-display text-lg font-bold text-stone-800">Política de Privacidade</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="prose prose-stone prose-lg max-w-none bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-stone-100">
            <p className="text-stone-500 text-sm">Última atualização: 11 de fevereiro de 2026</p>

            <h2>1. Introdução</h2>
            <p>
              A OlieCare ("nós", "nosso") opera a plataforma OlieCare (oliecare.cloud), um aplicativo web 
              progressivo (PWA) para acompanhamento da rotina de bebês. Esta Política de Privacidade descreve 
              como coletamos, usamos, armazenamos e protegemos suas informações pessoais e as informações de seus 
              filhos.
            </p>

            <h2>2. Dados que coletamos</h2>
            <h3>2.1 Dados fornecidos por você</h3>
            <ul>
              <li><strong>Dados de cadastro:</strong> nome completo, email, senha (criptografada), CPF (opcional), telefone (opcional), data de nascimento, gênero, cidade e estado.</li>
              <li><strong>Dados do bebê:</strong> nome, data de nascimento, sexo, peso e comprimento ao nascer, tipo sanguíneo e informações de saúde.</li>
              <li><strong>Dados de rotina:</strong> registros de alimentação (amamentação, mamadeira), sono, fraldas, banho, extração de leite, crescimento e marcos de desenvolvimento.</li>
            </ul>

            <h3>2.2 Dados coletados automaticamente</h3>
            <ul>
              <li><strong>Dados de uso:</strong> informações sobre como você interage com o app, incluindo horários de acesso e funcionalidades utilizadas.</li>
              <li><strong>Dados do dispositivo:</strong> tipo de navegador, sistema operacional, idioma e tokens de notificação push (quando autorizados).</li>
              <li><strong>Cookies e armazenamento local:</strong> utilizamos localStorage para preferências de tema e tokens de autenticação (JWT).</li>
            </ul>

            <h2>3. Como usamos seus dados</h2>
            <ul>
              <li>Fornecer e manter os serviços da plataforma OlieCare.</li>
              <li>Gerar insights e análises personalizadas sobre a rotina do seu bebê.</li>
              <li>Enviar notificações push sobre lembretes e alertas (quando autorizado).</li>
              <li>Enviar comunicações por email (confirmação de conta, recuperação de senha, novidades).</li>
              <li>Melhorar nossos serviços com base em padrões de uso agregados e anonimizados.</li>
              <li>Permitir o compartilhamento de dados com cuidadores e profissionais de saúde autorizados por você.</li>
            </ul>

            <h2>4. Compartilhamento de dados</h2>
            <p>
              Seus dados pessoais e de seus filhos <strong>não são vendidos</strong> a terceiros. 
              Compartilhamos dados apenas nas seguintes situações:
            </p>
            <ul>
              <li><strong>Com cuidadores:</strong> quando você explicitamente convida um cuidador ou profissional para acessar os dados do bebê.</li>
              <li><strong>Com profissionais de saúde:</strong> quando você autoriza o compartilhamento via convite no portal profissional.</li>
              <li><strong>Provedores de serviço:</strong> utilizamos serviços como MailerSend (email transacional), Firebase (notificações push) e servidores seguros para hospedar a plataforma.</li>
              <li><strong>Obrigações legais:</strong> quando exigido por lei ou ordem judicial.</li>
            </ul>

            <h2>5. Segurança dos dados</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul>
              <li>Criptografia de senhas com algoritmos seguros (bcrypt).</li>
              <li>Comunicação via HTTPS (TLS/SSL) em toda a plataforma.</li>
              <li>Autenticação via tokens JWT com expiração configurada.</li>
              <li>Acesso restrito por roles (PARENT, CAREGIVER, PEDIATRICIAN, ADMIN).</li>
              <li>Banco de dados PostgreSQL com backups regulares.</li>
            </ul>

            <h2>6. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta, 
              removeremos seus dados pessoais em até 30 dias, salvo obrigação legal de retenção.
            </p>

            <h2>7. Seus direitos (LGPD)</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul>
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Solicitar portabilidade dos dados.</li>
              <li>Revogar consentimento a qualquer momento.</li>
              <li>Solicitar exclusão da conta e todos os dados associados.</li>
            </ul>

            <h2>8. Cookies e tecnologias similares</h2>
            <p>
              Utilizamos localStorage para armazenar preferências de tema e dados de autenticação. 
              Não utilizamos cookies de rastreamento de terceiros. O Service Worker da PWA armazena 
              em cache recursos estáticos e respostas de API para funcionamento offline.
            </p>

            <h2>9. Dados de menores</h2>
            <p>
              A OlieCare é projetada para uso por pais, mães e cuidadores. Os dados de bebês e crianças 
              são registrados exclusivamente por seus responsáveis legais. Não coletamos dados diretamente 
              de menores de idade.
            </p>

            <h2>10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
              alterações significativas por email ou por meio de aviso na plataforma. Recomendamos 
              revisar esta página regularmente.
            </p>

            <h2>11. Contato</h2>
            <p>
              Para dúvidas, solicitações ou exercício de seus direitos, entre em contato:
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
