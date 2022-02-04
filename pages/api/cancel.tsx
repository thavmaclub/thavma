import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

import { APIError, User } from 'lib/model';
import handle from 'lib/api/handle';
import log from 'lib/log';
import stripe from 'lib/api/stripe';
import supabase from 'lib/api/supabase';

export default async function payAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      log.info('Verifying authentication...');
      if (!req.headers.authorization) throw new APIError('Invalid JWT', 401);
      const jwt = req.headers.authorization.replace('Bearer ', '');
      const { user, error: e } = await supabase.auth.api.getUser(jwt);
      if (e) throw new APIError(e.message, 401);
      if (!user) throw new APIError('Invalid user', 401);

      log.info(`Selecting user (${user.id}) row...`);
      const { data, error: er } = await supabase
        .from<User>('users')
        .select()
        .eq('id', user.id);
      if (er) throw new APIError(er.message, 500);
      if (!data?.length) throw new APIError('No user', 404);
      if (!data[0].sub) throw new APIError('No subscription', 404);

      log.info(`Deleting subscription (${data[0].sub})...`);
      await stripe.subscriptions.del(data[0].sub);
      const row = { access: false, sub: null };

      log.info(`Updating user (${user.id}) row... ${JSON.stringify(row)}`);
      const { error: err } = await supabase
        .from<User>('users')
        .update(row)
        .eq('id', user.id);
      if (err) throw new APIError(err.message, 500);

      res.status(200).json({});
    } catch (e) {
      handle(e, res);
    }
  }
}
