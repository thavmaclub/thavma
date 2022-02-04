import Stripe from 'stripe';

export default new Stripe(process.env.STRIPE_KEY as string, {
  apiVersion: '2020-08-27',
});
