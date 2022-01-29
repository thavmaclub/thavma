import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

import Form from 'components/form';
import Header from 'components/header';
import Page from 'components/page';
import TextField from 'components/textfield';
import ThemeSelect from 'components/theme-select';

import { Assessment } from 'lib/model';
import supabase from 'lib/supabase';
import useNProgress from 'lib/nprogress';

export default function AssessmentsPage(): JSX.Element {
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
      .insert({ name, pwd: nanoid(), questions: [] });
    setLoading(false);
    if (e) {
      setError(true);
      window.analytics?.track('Assessment Errored', { name, error: e.message });
    } else {
      setName('');
      window.analytics?.track('Assessment Created', { name });
    }
  }, [name, setLoading]);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from<Assessment>('assessments')
        .select();
      setAssessments((prev) => data ?? prev);
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
        console.log('Payload received:', payload);
      })
      .on('INSERT', (payload: SupabaseRealtimePayload<Assessment>) => {
        setAssessments((prev) => [payload.new, ...prev]);
        console.log('Payload received:', payload);
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
          {assessments.map((assessment) => (
            <li>
              <dl className='wrapper' key={assessment.id}>
                <dt>name</dt>
                <dd>{assessment.name}</dd>
                <dt>link</dt>
                <dd><Link href={`/assessments/${assessment.id}`}><a>thavma.club/assessments/{assessment.id}</a></Link></dd>
                <dt>pwd</dt>
                <dd>{assessment.pwd}</dd>
              </dl>
            </li>
          ))}
        </ul>
        <style jsx>{`
          a {
            color: inherit;
          }

          ul {
            padding: 0;
            margin: 0;
          }

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

          dd {
            margin: 0;
          }
        `}</style>
      </main>
    </Page>
  );
}
