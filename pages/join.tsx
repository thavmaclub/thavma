import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Form from 'components/form';
import Page from 'components/page';

import { Code } from 'lib/model';
import supabase from 'lib/supabase';
import { useAccess } from 'lib/context/access';
import useNProgress from 'lib/nprogress';

export default function JoinPage(): JSX.Element {
  const { access } = useAccess();
  const { loading, setLoading } = useNProgress();
  const { prefetch, replace } = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const onSubmit = useCallback(async (evt: FormEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    setLoading(true);
    setError(false);
    window.analytics?.track('Code Submitted', { code });
    const { data, error: e } = await supabase
      .from<Code>('codes')
      .select()
      .eq('id', code)
      .is('user', null);
    if (!data?.length || e) {
      window.analytics?.track('Code Errored', { code, error: e?.message });
      setLoading(false);
      setError(true);
    } else {
      window.analytics?.track('Code Worked', { code });
      const url = `${window.location.protocol}//${window.location.host}`;
      const redirectTo = `${url}/?code=${code}`;
      if (process.env.NEXT_PUBLIC_APP_ENV === 'test') {
        window.open(redirectTo); // @see {@link https://git.io/JP7d9}
      } else {
        await supabase.auth.signIn({ provider: 'google' }, { redirectTo });
      }
    }
  }, [code, setLoading]);

  useEffect(() => {
    void prefetch('/');
  }, [prefetch]);
  useEffect(() => {
    if (access === true) void replace('/');
  }, [replace, access]);
  
  return (
    <Page name='Join'>
      <main className='wrapper'>
        <div className='centered'>
          <header>
            <h1>T H A V M A</h1>
            <p>find out what’s on your next test;</p>
            <p>if your teachers won’t tell you, we will</p>
          </header>
          <Form
            id='code'
            label='[beta][invite only][$1/wk]'
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
        
          .centered > :global(form) {
            margin-top: 24px;
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
            margin: 0 0 24px;
          }

          p {
            font-size: 1.25rem;
            color: var(--accents-5);
            margin: 8px 0 0;
          }
          
          .error {
            color: var(--error);
            font-size: 0.75rem;
            font-weight: 500;
            margin-top: 12px;
          }
        `}</style>
      </main>
    </Page>
  );
}
