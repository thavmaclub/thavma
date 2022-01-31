import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Page from 'components/page';
import TextField from 'components/textfield';

import supabase from 'lib/supabase';
import { useAccess } from 'lib/context/access';
import useNProgress from 'lib/nprogress';

export default function JoinPage(): JSX.Element {
  const { access } = useAccess();
  const { loading, setLoading } = useNProgress();
  const { prefetch, replace, query } = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const onSubmit = useCallback(
    async (evt: FormEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
      setLoading(true);
      setError(false);
      window.analytics?.track('Code Submitted', { code });
      const { data: exists, error: e } = await supabase.rpc<boolean>(
        'code_exists',
        { code }
      );
      if (!exists || e) {
        window.analytics?.track('Code Errored', { code, error: e?.message });
        setLoading(false);
        setError(true);
      } else {
        window.analytics?.track('Code Worked', { code });
        const base = `${window.location.protocol}//${window.location.host}`;
        const uri = typeof query.r === 'string' ? query.r : '/';
        const url = new URL(decodeURIComponent(uri), base);
        const redirectTo = `${base}${url.pathname}${
          url.search ? `${url.search}&code=${code}` : `?code=${code}`
        }`;
        if (process.env.NEXT_PUBLIC_APP_ENV === 'test') {
          window.open(redirectTo); // @see {@link https://git.io/JP7d9}
        } else {
          await supabase.auth.signIn({ provider: 'google' }, { redirectTo });
        }
      }
    },
    [code, setLoading, query.r]
  );

  useEffect(() => {
    void prefetch('/');
  }, [prefetch]);
  useEffect(() => {
    if (access !== true) return;
    const uri = typeof query.r === 'string' ? query.r : '/';
    void replace(decodeURIComponent(uri));
  }, [replace, access, query.r]);

  return (
    <Page name='Join'>
      <main className='wrapper'>
        <div className='centered'>
          <header>
            <h1>T H A V M A</h1>
          </header>
          <TextField
            id='code'
            label='[beta][invite only]'
            loading={loading}
            error={error}
            value={code}
            setValue={(v) => {
              window.analytics?.track('Code Changed', { code: v });
              setCode(v);
            }}
            button='request access'
            placeholder='invite code'
            onSubmit={onSubmit}
          />
          {typeof access === 'string' && <p className='error'>{access}</p>}
        </div>
        <style jsx>{`
          main {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            min-height: 100vh;
          }

          .centered {
            margin: 48px 0;
          }

          .centered > :global(form button) {
            width: 85px;
          }

          header {
            margin-bottom: 36px;
          }

          h1 {
            font-size: 4rem;
            line-height: 1;
            margin: 0;
          }

          .error {
            margin: 12px 0 0;
            font-size: 0.875rem;
            color: var(--error);
            width: 0;
            min-width: 100%;
            max-width: 100%;
          }
        `}</style>
      </main>
    </Page>
  );
}
