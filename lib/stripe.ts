import { Stripe, loadStripe } from '@stripe/stripe-js';

let prom: Promise<Stripe | null> | undefined;
export default function getStripe(): Promise<Stripe> {
  if (!prom) prom = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string);
  // `loadStripe` will only resolve to `null` if called server-side.
  // @see {@link https://github.com/stripe/stripe-js#loadstripe}
  return prom as Promise<Stripe>;
}
