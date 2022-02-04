import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

import { APIError, User } from 'lib/model';
import handle from 'lib/api/handle';
import log from 'lib/log';
import stripe from 'lib/api/stripe';
import supabase from 'lib/api/supabase';

async function setAccess(sub: Stripe.Subscription): Promise<void> {
  const cusId = sub.customer as string;
  const data = { access: sub.status === 'active' };
  log.debug(`Updating user (${cusId}) row... ${JSON.stringify(data)}`);
  const { error: e } = await supabase
    .from<User>('users')
    .update(data)
    .eq('cus', cusId);
  if (e) throw new APIError(e.message, 500);
}

export const config = { api: { bodyParser: false } };
export default async function webhookAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      const r = await buffer(req);
      const sig = req.headers['stripe-signature'];
      if (typeof sig !== 'string') throw new APIError('No signature', 400);
      const secret = process.env.STRIPE_WEBHOOK_SECRET as string;
      const evt = stripe.webhooks.constructEvent(r.toString(), sig, secret);
      const data = evt.data.object;
      log.trace(`Event (${evt.type}) data: ${JSON.stringify(data, null, 2)}`);
      switch (evt.type) {
        case 'invoice.payment_succeeded': {
          log.info('Payment succeeded, setting default payment method...');
          const subId = (data as Stripe.Invoice).subscription as string;
          const payId = (data as Stripe.Invoice).payment_intent as string;
          const payment = await stripe.paymentIntents.retrieve(payId);
          await stripe.subscriptions.update(subId, {
            default_payment_method: payment.payment_method as string,
          });
          break;
        }
        case 'customer.subscription.created': {
          log.info('Subscription created, setting access...');
          await setAccess(data as Stripe.Subscription);
          break;
        }
        case 'customer.subscription.updated': {
          log.info('Subscription updated, setting access...');
          await setAccess(data as Stripe.Subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          log.info('Subscription deleted, setting access...');
          await setAccess(data as Stripe.Subscription);
          break;
        }
        default:
          log.warn(`Unexpected event type (${evt.type}), ignoring...`);
      }
      res.status(200).end();
    } catch (e) {
      handle(e, res);
    }
  }
}
