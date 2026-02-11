// Olive Baby Web - Professional Settings
import { Card, CardBody, CardHeader } from '../../components/ui';

export function ProfSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>
      <Card>
        <CardHeader title="Perfil" subtitle="Informações do profissional" />
        <CardBody>
          <p className="text-gray-500">Configurações em desenvolvimento.</p>
        </CardBody>
      </Card>
      <Card className="mt-6">
        <CardHeader title="Clínica" subtitle="Dados da clínica (white-label)" />
        <CardBody>
          <p className="text-gray-500">Gestão de clínica e personalização em desenvolvimento.</p>
        </CardBody>
      </Card>
    </>
  );
}
