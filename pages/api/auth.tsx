import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

import { APIError, Code } from 'lib/model';
import handle from 'lib/api/handle';
import logger from 'lib/api/logger';
import supabase from 'lib/api/supabase';

function getParameterByName(name: string, url: string): string | null {
  /* eslint-disable-next-line no-useless-escape */
  const key = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&#]${key}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export default async function authAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      logger.info('Getting user from access token...');
      const token = getParameterByName('access_token', req.url || '');
      if (!token) throw new APIError('No access token', 401);
      const { user, error: e } = await supabase.auth.api.getUser(token);
      if (e) throw new APIError(`Error getting user: ${e.message}`, 401);
      if (!user) throw new APIError('No user', 401);
      if (typeof req.query.code !== 'string')
        throw new APIError('No code', 401);
      const { error: err } = await supabase
        .from<Code>('codes')
        .update({ user: user.id })
        .eq('id', req.query.code);
      if (err)
        throw new APIError(
          'The invite code you used was invalid or had already been used by another email address. Try logging in again with a different Google account.',
          401
        );
    } catch (e) {
      handle(e, res);
    }
  }
}
