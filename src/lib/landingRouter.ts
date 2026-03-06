// Olive Baby Web - Landing Router
// Decide qual landing exibir (B2C ou B2B) baseado em domínio e parâmetros de campanha

import { isProfessionalDomain } from './domain';

/**
 * Verifica se deve exibir a landing B2B (profissionais) em vez da B2C (famílias).
 * Usado para roteamento por domínio (prof.oliecare.cloud) e parâmetros de campanha (UTM, ref).
 */
export function shouldShowB2BLanding(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Domínio profissional
  if (isProfessionalDomain()) return true;

  // 2. Query params de campanha
  const params = new URLSearchParams(window.location.search);
  if (params.get('utm_campaign') === 'prof') return true;
  if (params.get('utm_source') === 'prof') return true;
  if (params.get('ref') === 'prof') return true;

  return false;
}
