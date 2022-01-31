import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import Join from 'components/join';
import Page from 'components/page';
import TextField from 'components/textfield';

import supabase from 'lib/supabase';
import useNProgress from 'lib/nprogress';
import { useUser } from 'lib/context/user';

export default function JoinPage(): JSX.Element {
  const { user } = useUser();
  const { loading, setLoading } = useNProgress();
  const { prefetch, replace, query } = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const uri = useMemo(
    () => (typeof query.r === 'string' ? query.r : '%2F'),
    [query.r]
  );
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
        const redirectTo = `${base}/pay?r=${uri}&code=${code}`;
        if (process.env.NEXT_PUBLIC_APP_ENV === 'test') {
          window.open(redirectTo); // @see {@link https://git.io/JP7d9}
        } else {
          await supabase.auth.signIn({ provider: 'google' }, { redirectTo });
        }
      }
    },
    [code, setLoading, uri]
  );

  useEffect(() => {
    void prefetch('/pay');
  }, [prefetch]);
  useEffect(() => {
    if (user?.access === true) void replace(decodeURIComponent(uri));
    if (user?.access === false) void replace(`/pay?r=${uri}`);
  }, [uri, user, replace]);

  return (
    <Page name='Join'>
      <Join>
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
      </Join>
    </Page>
  );
}
