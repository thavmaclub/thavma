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
  const [assessment, setAssessment] = useState<Assessment>();
  const [ext, setExt] = useState<boolean>();
  const verifyExt = useCallback((assessmentId: number) => {
    window.postMessage(assessmentId);
    const timeoutId = setTimeout(() => {
      setExt(false);
      /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
      window.removeEventListener('message', listener);
    }, 500);
    const listener = (msg: { data: unknown }) => {
      if (msg.data !== 'THAVMA_EXT_ACTIVE') return;
      clearTimeout(timeoutId);
      setExt(true);
      window.removeEventListener('message', listener);
    };
    window.addEventListener('message', listener);
  }, []);

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
    const { data, error: e } = await supabase
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
    } else if (!data?.length) {
      setError(true);
      window.analytics?.track('Assessment Empty', { name });
    } else {
      setName('');
      setAssessment(data[0]);
      verifyExt(data[0].id);
      window.analytics?.track('Assessment Created', { id: data[0].id, name });
    }
  }, [name, setLoading, verifyExt]);

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
        {ext === false && assessment && (
          <div className='dialog'>
            <article>
              <p>to connect to your friend—and their answers—during your <i>{assessment.name}</i>, you’ll have to install THAVMA’s Firefox extension (and, ofc, install Firefox first):</p>
              <div className='buttons'>
                <a href='https://mozilla.org/firefox/download/thanks' target='_blank' rel='noopener noreferrer'>
                  1. install Firefox 
                </a>
                <a href='/thavma.xpi'>
                  2. install extension
                </a>
                <button type='button' onClick={() => verifyExt(assessment.id)}>
                  3. verify installation
                </button>
              </div>
            </article>
          </div>
        )}
        {ext === true && assessment && (
          <div className='dialog'>
            <article>
              <p>you’re almost set; now, simply:</p>
              <ol>
                <li>send your test link and pwd to a friend</li>
                <li>click on THAVMA’s extension icon (the black box in the top right of Firefox) <b>a single time</b> (clicking multiple times can cause issues) after Schoology’s test questions have loaded</li>
                <li>hover over the bottom left of Schoology to see your friend’s answers as they go</li>
              </ol>
              <p>remember, with great pwr comes great responsibility:</p>
              <div className='buttons'>
                <button type='button' onClick={() => setExt(undefined)}>
                  i agree not to raise my test average more than 25%
                </button>
              </div>
            </article>
          </div>
        )}
        <ul className='assessments'>
          {(!access || !loaded) && Array(5).fill(null).map((_, idx) => <TestLI key={idx} />)}
          {access && assessments.map((a) => <TestLI key={a.id} {...a} />)}
          {access && loaded && !assessments.length && (
            <li>
              <div className='wrapper'>
                <Empty>
                  <p>
                    no assessments to show yet;<br />
                    create one with the form above 
                  </p>
                </Empty>
              </div>
            </li>
          )}
        </ul>
        <style jsx>{`
          ul {
            padding: 0;
            margin: 0;
          }
        
          ul li {
            border-top: 1px solid var(--accents-2);
            list-style: none;
          }

          .dialog {
            position: fixed;
            top: 50%;
            width: 100%;
            transform: translateY(-50%);
            pointer-events: none;
          }

          .dialog article {
            pointer-events: auto;
            background: var(--background);
            border: 1px solid var(--accents-2);
            border-radius: var(--radius);
            box-shadow: var(--shadow-large);
            padding: 48px;
            max-width: 500px;
            margin: 24px auto;
          }

          .dialog article p {
            margin: 0;
          }

          .dialog .buttons {
            margin-top: 24px;
          }

          .dialog .buttons a,
          .dialog .buttons button {
            background: var(--on-background);
            color: var(--background);
            padding: 12px 24px;
            border: unset;
            border-radius: var(--radius);
            display: block;
            margin: 12px auto 0;
            width: 100%;
            max-width: 250px;
            text-decoration: none;
            font-size: 0.875rem;
            line-height: 1;
            text-align: center;
            font: inherit;
            appearance: unset;
            cursor: pointer;
          }
        `}</style>
      </main>
    </Page>
  );
}
