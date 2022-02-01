import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StripeCardElement, StripeElementStyle } from '@stripe/stripe-js';
import cn from 'classnames';
import { useRouter } from 'next/router';

import Input from 'components/input';
import Join from 'components/join';
import Page from 'components/page';

import fetcher from 'lib/fetch';
import getStripe from 'lib/stripe';
import supabase from 'lib/supabase';
import useNProgress from 'lib/nprogress';
import { useTheme } from 'lib/context/theme';
import { useUser } from 'lib/context/user';

function getElementStyle(): StripeElementStyle {
  const styles = getComputedStyle(document.body);
  return {
    base: {
      color: styles.getPropertyValue('--on-background'),
      fontFamily: styles.getPropertyValue('--font-mono'),
      fontSize: `${0.875 * 12}px`,
      fontWeight: 400,
      iconColor: styles.getPropertyValue('--on-background'),
      '::selection': {
        backgroundColor: styles.getPropertyValue('--selection'),
        color: styles.getPropertyValue('--on-selection'),
      },
      '::placeholder': {
        iconColor: styles.getPropertyValue('--accents-4'),
        color: styles.getPropertyValue('--accents-4'),
      },
      ':disabled': {
        iconColor: styles.getPropertyValue('--accents-4'),
        color: styles.getPropertyValue('--accents-4'),
      },
    },
    invalid: {
      iconColor: styles.getPropertyValue('--on-background'),
      color: styles.getPropertyValue('--on-background'),
    },
  };
}

export default function PayPage(): JSX.Element {
  const { user, setUser } = useUser();
  const { prefetch, replace, query } = useRouter();
  const uri = useMemo(
    () => (typeof query.r === 'string' ? query.r : '%2F'),
    [query.r]
  );

  useEffect(() => {
    void prefetch('/join');
    void prefetch(decodeURIComponent(uri));
  }, [uri, prefetch]);
  useEffect(() => {
    if (user === null) void replace(`/join?r=${uri}`);
    if (user?.access === true) void replace(decodeURIComponent(uri));
  }, [uri, user, replace]);

  const card = useRef<StripeCardElement>();
  const [error, setError] = useState('');
  useEffect(() => {
    void (async () => {
      const stripe = await getStripe();
      const elements = stripe.elements();
      card.current = elements.create('card', { style: getElementStyle() });
      card.current.mount('#card');
      card.current.on('change', (evt) => {
        setError(evt.error?.message || '');
      });
    })();
  }, []);
  const { theme } = useTheme();
  useEffect(() => {
    // setTimeout to wait for pages/_app's useEffect to run first and set vars;
    // otherwise, getElementStyle() returns the previous set of CSS theme vars.
    const timeoutId = setTimeout(() => {
      card.current?.update({ style: getElementStyle() });
    }, 1);
    return () => clearTimeout(timeoutId);
  }, [theme]);
  const { loading, setLoading } = useNProgress();
  const onSubmit = useCallback(
    async (evt: FormEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
      setLoading(true);
      setError('');
      card.current?.update({ disabled: true });
      try {
        const stripe = await getStripe();
        const { secret } = await fetcher<{ secret: string }>('/api/pay');
        const { error: e } = await stripe.confirmCardPayment(secret, {
          payment_method: {
            card: card.current as StripeCardElement,
            billing_details: {
              email: supabase.auth.user()?.email,
              name: supabase.auth.user()?.user_metadata.name as string,
              phone: user?.phone ?? undefined,
            },
          },
        });
        if (e) throw new Error(`Error confirming payment: ${e.message ?? ''}`);
        setUser((prev) => (prev ? { ...prev, access: true } : prev));
        await replace(decodeURIComponent(uri)); // Page change calls getUser()
      } catch (e) {
        setLoading(false);
        card.current?.update({ disabled: false });
        setError(`Payment error: ${(e as Error).message}`);
      }
    },
    [user, setUser, setLoading, replace, uri]
  );

  return (
    <Page name='Pay'>
      <Join error={error}>
        <Input
          error={!!error}
          loading={loading}
          label='[$10/wk][secured by stripe]'
          id='card'
          button='gain access'
          onSubmit={onSubmit}
        >
          <div
            className={cn('input', { error, disabled: loading })}
            id='card'
          />
          <style jsx>{`
            #card {
              display: flex;
              align-items: center;
              justify-content: left;
            }

            #card :global(div) {
              width: 100%;
            }
          `}</style>
        </Input>
      </Join>
    </Page>
  );
}
