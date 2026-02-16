export const normalizeRole = (role?: string | null): string => (role || '').trim().toUpperCase();

export const isCLevelRole = (role?: string | null): boolean => {
  const r = normalizeRole(role);
  return r.length === 3 && r.startsWith('C') && r.endsWith('O');
};

export const isAdminLikeRole = (role?: string | null): boolean => {
  const r = normalizeRole(role);
  return r === 'ADMIN' || r === 'CEO' || r === 'CXO' || isCLevelRole(r);
};

export const isManagerRole = (role?: string | null): boolean => normalizeRole(role) === 'MANAGER';
