import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import cn from 'classnames';
import { nanoid } from 'nanoid';

import Empty from 'components/empty';
import Form from 'components/form';
import Header from 'components/header';
import Page from 'components/page';
import TextField from 'components/textfield';
import ThemeSelect from 'components/theme-select';

import { Assessment } from 'lib/model';
import dateString from 'lib/date';
import supabase from 'lib/supabase';
import { useAccess } from 'lib/context/access';
import useNProgress from 'lib/nprogress';

function TestLI({ id, name, date, pwd }: Partial<Assessment>): JSX.Element {
  const loading = useMemo(() => !id && !name && !date && !pwd, [id, name, date, pwd]);
  useEffect(() => {
    if (!id || !name || !date || !pwd) return;
    window.analytics?.track('Assessment Viewed', { id, name, date, pwd });
  }, [id, name, date, pwd]);
  return (
    <li>
      <dl className='wrapper'>
        <dt className={cn({ loading })}>{!loading && 'name'}</dt>
        <dd className={cn({ loading })}>
          {!loading && name}<br />
          <span>{!loading && date && dateString(date)}</span>
        </dd>
        <dt className={cn({ loading })}>{!loading && 'link'}</dt>
        <dd className={cn({ loading })}>
          {!loading && id && (
            <Link href={`/assessments/${id}`}>
              <a>thavma.club/assessments/{id}</a>
            </Link>
          )}
        </dd>
        <dt className={cn({ loading })}>{!loading && 'pwd'}</dt>
        <dd className={cn({ loading })}>{!loading && pwd}</dd>
      </dl>
      <style jsx>{`
        li {
          border-top: 1px solid var(--accents-2);
          padding: 48px 0;
          list-style: none;
        }
        
        dt {
          font-weight: 600;
          margin: 12px 0 0;
        }

        dt:first-child {
          margin-top: 0;
        }

        dt.loading {
          height: 15px;
          max-width: 48px;
          margin-bottom: 6px;
        }

        dd {
          margin: 0;
        }

        dd.loading {
          min-height: 15px;
          max-width: 200px;
        }

        dd span {
          text-transform: lowercase;
          color: var(--accents-5);
        }
        
        dd.loading span {
          height: 15px;
          display: block;
        }

        dd a {
          color: inherit;
        }
      `}</style>
    </li>
  );
}

export default function AssessmentsPage(): JSX.Element {
  const { access } = useAccess({ required: true });
  const { loading, setLoading } = useNProgress();
  const [error, setError] = useState(false);
  const [name, setName] = useState('');
  const onSubmit = useCallback(async (evt: FormEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    setLoading(true);
    setError(false);
    window.analytics?.track('Assessment Submitted', { name });
    const { error: e } = await supabase
      .from<Assessment>('assessments')
      .insert({ 
        name, 
        creator: supabase.auth.user()?.id,
        pwd: nanoid(), 
        date: new Date(), 
        questions: [],
      });
    setLoading(false);
    if (e) {
      setError(true);
      window.analytics?.track('Assessment Errored', { name, error: e.message });
    } else {
      setName('');
      window.analytics?.track('Assessment Created', { name });
    }
  }, [name, setLoading]);

  const [loaded, setLoaded] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from<Assessment>('assessments')
        .select()
        .order('date', { ascending: false });
      setAssessments((prev) => data ?? prev);
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    const subscription = supabase
      .from<Assessment>('assessments')
      .on('DELETE', (payload: SupabaseRealtimePayload<Assessment>) => {
        setAssessments((prev) => {
          const idx = prev.findIndex((a) => a.id === payload.old.id);
          return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        });
      })
      .on('INSERT', (payload: SupabaseRealtimePayload<Assessment>) => {
        setAssessments((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => void supabase.removeSubscription(subscription);
  }, []);

  return (
    <Page name='Assessments'>
      <main>
        <Header />
        <Form>
          <ThemeSelect />
          <TextField
            id='name'
            label='[create assessment]'
            value={name}
            setValue={(v) => {
              window.analytics?.track('Assessment Changed', { name: v });
              setName(v);
            }}
            button='create'
            placeholder='ex: chapter 6 psych test'
            onSubmit={onSubmit}
            loading={loading}
            error={error}
          />
        </Form>
        <ul>
          {(!access || !loaded) && Array(5).fill(null).map((_, idx) => <TestLI key={idx} />)}
          {access && assessments.map((a) => <TestLI key={a.id} {...a} />)}
          {access && loaded && !assessments.length && (
            <li>
              <div className='wrapper'>
                <Empty>no assessments to show yet</Empty>
              </div>
            </li>
          )}
        </ul>
        <style jsx>{`
          ul {
            padding: 0;
            margin: 0;
          }
        
          li {
            border-top: 1px solid var(--accents-2);
            list-style: none;
          }
        `}</style>
      </main>
    </Page>
  );
}
