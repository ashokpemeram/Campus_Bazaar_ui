export const buildMediaUrl = (pathOrUrl, serverBase = import.meta.env.VITE_SERVER_URL) => {
  if (!pathOrUrl) return '';

  const value = String(pathOrUrl);
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;

  const base = (serverBase || '').replace(/\/$/, '');
  return `${base}/uploads/${value}`;
};

