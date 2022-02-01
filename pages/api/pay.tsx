import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import Stripe from 'stripe';

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
      const row: Partial<User> = data?.length ? data[0] : {};
      let secret: string | null = null;

      const update = async (d: Partial<User>) => {
        log.info(`Updating user (${user.id}) row... ${JSON.stringify(d)}`);
        const { error: err } = await supabase
          .from<User>('users')
          .update(d)
          .eq('id', user.id);
        if (err) throw new APIError(`Error updating user: ${err.message}`, 500);
      };

      if (!row.cus) {
        log.info(`Creating Stripe customer for user (${user.id})...`);
        const cus = await stripe.customers.create({
          email: user.email,
          phone: user.phone,
        });
        await update({ cus: cus.id });
        row.cus = cus.id;
      }
      if (!row.sub) {
        log.info(`Creating Stripe subscription for user (${user.id})...`);
        const sub = await stripe.subscriptions.create({
          customer: row.cus,
          items: [{ price: process.env.STRIPE_PRICE_ID }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });
        await update({ sub: sub.id });
        row.sub = sub.id;
        secret = (
          (sub.latest_invoice as Stripe.Invoice)
            .payment_intent as Stripe.PaymentIntent
        ).client_secret;
      }
      if (!secret) {
        const sub = await stripe.subscriptions.retrieve(row.sub, {
          expand: ['latest_invoice.payment_intent'],
        });
        secret = (
          (sub.latest_invoice as Stripe.Invoice)
            .payment_intent as Stripe.PaymentIntent
        ).client_secret;
      }

      res.status(201).json({ secret });
    } catch (e) {
      handle(e, res);
    }
  }
}
