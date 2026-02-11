// Olive Baby Web - Domain Utilities
// Verifica em qual dominio/subdominio o app esta rodando

const ADMIN_HOSTNAMES = [
  'adm.oliecare.cloud',
  'admin.oliecare.cloud',
];

const PROF_HOSTNAMES = [
  'prof.oliecare.cloud',
  'professional.oliecare.cloud',
];

/**
 * Extrai slug da clínica do hostname (ex: clinica-x.oliecare.cloud -> clinica-x)
 */
export function getClinicSlugFromHostname(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const search = new URLSearchParams(window.location.search);
    return search.get('clinic') || null;
  }
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[parts.length - 2] === 'oliecare' && parts[parts.length - 1] === 'cloud') {
    const slug = parts[0];
    if (slug && slug !== 'app' && slug !== 'adm' && slug !== 'admin' && slug !== 'prof' && slug !== 'professional' && slug !== 'www') {
      return slug;
    }
  }
  return null;
}

/**
 * Verifica se o app esta rodando no subdominio admin
 */
export function isAdminDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return ADMIN_HOSTNAMES.includes(hostname);
}

/**
 * Verifica se o app esta rodando no subdominio profissional ou white-label
 */
export function isProfessionalDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const search = new URLSearchParams(window.location.search);
    return search.get('domain') === 'prof';
  }
  return PROF_HOSTNAMES.includes(hostname) || !!getClinicSlugFromHostname();
}

/**
 * Verifica se o app esta rodando no dominio principal (nao-admin, nao-prof)
 */
export function isMainDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return !ADMIN_HOSTNAMES.includes(hostname) && !PROF_HOSTNAMES.includes(hostname) && !getClinicSlugFromHostname();
}

/**
 * Retorna a URL do admin console
 */
export function getAdminUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return `/admin${path}`;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `/admin${path}`;
  }
  return `https://adm.oliecare.cloud${path}`;
}

/**
 * Retorna a URL do portal profissional
 */
export function getProfessionalUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return `/prof${path}`;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `/prof${path}`;
  }
  return `https://prof.oliecare.cloud${path}`;
}
