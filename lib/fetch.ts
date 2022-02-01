import to from 'await-to-js';

import { APIError } from 'lib/model';
import supabase from 'lib/supabase';

export default async function fetcher<T, D = T>(
  url: string,
  method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: D
): Promise<T> {
  const body = data ? JSON.stringify(data) : undefined;
  const token = supabase.auth.session()?.access_token;
  const headers: Record<string, string> = {};
  if (data) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const [err, res] = await to<Response>(fetch(url, { headers, method, body }));
  if (res && !res.ok) {
    const { message } = (await res.json()) as APIError;
    const msg = `API (${url}) responded with error: ${message}`;
    throw new APIError(msg, res.status);
  } else if (err) {
    throw new APIError(`${err.name} calling API (${url}): ${err.message}`);
  } else if (!res) {
    throw new APIError(`No response from API (${url})`);
  }
  return res.json() as Promise<T>;
}
