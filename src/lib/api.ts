const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include', // if using cookies
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
