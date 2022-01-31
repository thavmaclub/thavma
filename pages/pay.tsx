import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import Join from 'components/join';
import Page from 'components/page';
import TextField from 'components/textfield';

import useNProgress from 'lib/nprogress';
import { useUser } from 'lib/context/user';

export default function PayPage(): JSX.Element {
  const { user } = useUser();
  const { loading, setLoading } = useNProgress();
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

  const [card, setCard] = useState('');
  const [error, setError] = useState();

  return (
    <Page name='Pay'>
      <Join>
        <TextField
          id='card'
          label='[$10/wk][secure]'
          loading={loading}
          error={error}
          value={card}
          setValue={(v) => {
            window.analytics?.track('Card Changed', { card: v });
            setCard(v);
          }}
          button='pay'
          placeholder='credit card'
          onSubmit={() => {}}
        />
      </Join>
    </Page>
  );
}
