import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

import { APIError } from 'lib/model';
import handle from 'lib/api/handle';
import logger from 'lib/api/logger';
import supabase from 'lib/api/supabase';

export default async function existsAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      const { code } = req.query;
      if (typeof code !== 'string') throw new APIError('Invalid code', 400);
      logger.info(`Checking if code (${code}) exists...`);
      const { data, error } = await supabase.rpc<boolean>('code_exists', { code });
      const exists = data && !error;
      logger.info(`Sending code (${code}) exists response (${exists})...`);
      res.status(200).json({ exists });
    } catch (e) {
      handle(e, res);
    }
  }
}
