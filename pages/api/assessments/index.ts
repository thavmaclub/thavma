import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import cors from 'cors';

import { APIError, Assessment } from 'lib/model';
import handle from 'lib/api/handle';
import logger from 'lib/api/logger';
import middleware from 'lib/api/middleware';
import supabase from 'lib/api/supabase';

export default async function assessmentsAPI(req: Req, res: Res): Promise<void> {
  await middleware(req, res, cors());
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      logger.info('Creating assessment...');
      const { data, error } = await supabase
        .from<Assessment>('assessments')
        .insert(req.body);
      if (error) throw new APIError(error.message, 500);
      if (!data?.length) throw new APIError('No assessment data', 500);
      res.status(201).json(data[0]);
    } catch (e) {
      handle(e, res);
    }
  }
}
