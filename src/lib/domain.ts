// Olive Baby Web - Domain Utilities
// Verifica em qual dominio/subdominio o app esta rodando

const ADMIN_HOSTNAMES = [
  'adm.oliecare.cloud',
  'admin.oliecare.cloud',
];

/**
 * Verifica se o app esta rodando no subdominio admin
 * Em dev (localhost), retorna false - admin deve acessar via /admin normalmente
 */
export function isAdminDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return ADMIN_HOSTNAMES.includes(hostname);
}

/**
 * Verifica se o app esta rodando no dominio principal (nao-admin)
 */
export function isMainDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  // localhost/dev e tratado como main domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return !ADMIN_HOSTNAMES.includes(hostname);
}

/**
 * Retorna a URL do admin console
 */
export function getAdminUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return `/admin${path}`;
  const hostname = window.location.hostname;
  // Em dev, usa rota local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `/admin${path}`;
  }
  // Em producao, usa subdominio
  return `https://adm.oliecare.cloud${path}`;
}
