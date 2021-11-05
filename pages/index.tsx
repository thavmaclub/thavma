/* eslint-disable react/no-array-index-key */

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';

import BookIcon from 'components/icons/book';
import DarkIcon from 'components/icons/dark';
import Form from 'components/form';
import LightIcon from 'components/icons/light';
import Page from 'components/page';
import PinIcon from 'components/icons/pin';
import Select from 'components/select';
import SystemIcon from 'components/icons/system';

import { Test } from 'lib/model';
import supabase from 'lib/supabase';
import { useAccess } from 'lib/context/access';
import useNProgress from 'lib/nprogress';
import { useTheme } from 'lib/context/theme';
import { useUser } from 'lib/context/user';

import courses from 'assets/courses.json';
import tests from 'assets/tests.json';

function Header(): JSX.Element {
  return (
    <header className='wrapper'>
      <h1>T H A V M A</h1>
      <p>
        find out what’s on your next test;
        <br />
        if your teachers won’t tell you, we will
      </p>
      <style jsx>{`
        header {
          text-align: center;
          margin: 48px auto;
        }

        h1 {
          font-size: 36px;
          line-height: 1;
          margin: 12px 0;
        }

        @media (max-width: 400px) {
          h1 {
            font-size: 24px;
          }
        }

        p {
          color: var(--accents-5);
          margin: 0;
        }
      `}</style>
    </header>
  );
}

function TestSection({ name, date, difficulty, content }: Partial<Test>): JSX.Element {
  const loading = useMemo(() => !name || !date || !difficulty || !content, [name, date, difficulty, content]);
  useEffect(() => {
    if (!name || !date || !difficulty || !content) return;
    window.analytics?.track('Test Viewed', { name, date, difficulty, content });
  }, [name, date, difficulty, content]);
  return (
    <section>
      <header className='wrapper'>
        <h2 className={cn({ loading })}>{!loading && name}</h2>
        <p className={cn({ loading })}>
          {!loading && date && difficulty && `${new Date(date).toLocaleString('en', {
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          })} - ${difficulty}`}
        </p>
      </header>
      <ol className='wrapper'>
        {loading && Array(5).fill(null).map((_, idx) => <li key={idx} className='loading' />)}
        {!loading && content && content.map((c, idx) => (
          <li key={idx}>{c}</li>
        ))}
      </ol>
      <style jsx>{`
        section {
          border-top: 1px solid var(--accents-2);
          padding: var(--margin) 0;
        }

        h2 {
          text-transform: lowercase;
          font-size: 24px;
          font-weight: 400;
          line-height: 1;
          margin: 0 0 12px;
        }

        h2.loading {
          max-width: 200px;
          height: 24px;
        }

        .loading {
          border-radius: var(--radius);
        }

        p {
          text-transform: lowercase;
          color: var(--accents-5);
          margin: 0;
        }

        p.loading {
          max-width: 175px;
          height: 6px;
          margin-top: 12px;
        }

        header {
          margin: 48px auto;
        }

        li {
          margin: 24px 0;
        }

        li.loading {
          height: 54px;
          margin-left: -24px;
          list-style: none;
        }

        ol {
          padding-left: 48px;
          margin: 48px auto;
        }
      `}</style>
    </section>
  );
}

export default function IndexPage(): JSX.Element {
  const { access } = useAccess();
  const { theme, setTheme } = useTheme();
  const { push, prefetch, replace, query: { s, c } } = useRouter();
  const school = useMemo(() => typeof s === 'string' ? s : 'gunn', [s]);
  const course = useMemo(() => typeof c === 'string' ? c : courses[0].id, [c]);
 
  useEffect(() => {
    void prefetch('/join');
  }, [prefetch]);
  useEffect(() => {
    if (access === false) void replace('/join');
  }, [replace, access]);

  const { user, setUser } = useUser();
  const { loading, setLoading } = useNProgress();
  const [error, setError] = useState(false);
  const [phone, setPhone] = useState('');
  const onSubmit = useCallback(async (evt: FormEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    setLoading(true);
    setError(false);
    window.analytics?.track('Phone Submitted', { phone });
    const body = JSON.stringify({ phone });
    const headers = { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}` 
    };
    const res = await fetch('/api/users', { method: 'post', body, headers });
    setLoading(false);
    if (res.status !== 201) {
      setError(true);
      const { message } = (await res.json()) as { message: string };
      window.analytics?.track('Phone Errored', { phone, error: message });
    } else {
      setUser(await res.json());
      window.analytics?.track('Phone Saved', { phone });
    }
  }, [phone, setLoading, setUser]);

  return (
    <Page name='Index'>
      <main>
        <Header />
        <div className='form wrapper'>
          <Select
            options={[{ value: 'gunn', label: 'Gunn High School [beta]' }]}
            label='School'
            icon={<PinIcon />}
            value={school}
            onChange={(v) => {
              window.analytics?.track('School Selected', { school: v }); 
              return push(`/?s=${v}&c=${course}`, undefined, { shallow: true });
            }}
            disabled
          />
          <Select
            options={courses.map((cs) => ({ value: cs.id, label: cs.name }))}
            label='Course'
            icon={<BookIcon />}
            value={course}
            onChange={(v) => {
              window.analytics?.track('Course Selected', { course: v });
              return push(`/?s=${school}&c=${v}`, undefined, { shallow: true });
            }}
          />
          <Select
            value={theme}
            onChange={(v) => {
              window.analytics?.track('Theme Selected', { theme: v });
              setTheme(v);
            }}
            label='Theme'
            options={[
              {
                value: 'system',
                label: 'System',
                icon: <SystemIcon />,
              },
              {
                value: 'dark',
                label: 'Dark',
                icon: <DarkIcon />,
              },
              {
                value: 'light',
                label: 'Light',
                icon: <LightIcon />,
              },
            ]}
          />
          {!user && (
            <Form
              id='phone'
              label='[get invite codes]'
              value={phone}
              setValue={(v) => {
                window.analytics?.track('Phone Changed', { phone: v });
                setPhone(v);
              }}
              button='get codes'
              placeholder='phone number'
              onSubmit={onSubmit}
              loading={loading}
              error={error}
            />
          )}
        </div>
        {!access && Array(5).fill(null).map((_, idx) => <TestSection key={idx} />)}
        {access && tests
          .filter((t) => t.course === course)
          .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
          .map((t) => (
            <TestSection key={t.id} {...t} />
          ))}
        {access && !tests.some((t) => t.course === course) && ( 
          <section>
            <div className='wrapper'>
              <div className='empty'>
                <p>
                  no contributions to show yet;<br />
                  dm test info to <a href='https://instagram.com/thavmaclub' target='_blank' rel='noopener noreferrer'>@thavmaclub</a>
                </p>
              </div>
            </div>
          </section>
        )}
        <style jsx>{`
          section {
            border-top: 1px solid var(--accents-2);
            padding: var(--margin) 0;
          }
         
          .empty {
            border: 1px dashed var(--accents-2);
            border-radius: 4px;
            color: var(--accents-3);
            font-size: 1rem;
            font-weight: 400;
            position: relative;
            text-align: center;
            padding: 24px;
            height: 100%;
            min-height: 85vh; 
            margin: 48px 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
         
          .empty a {
            color: inherit;
          }

          .form {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 24px auto;
          }

          .form > :global(form) {
            margin-top: -${12 * 0.875 * 1.5 + 6}px;
            margin-left: var(--margin);
            flex: 1.5 1 0;
          }

          .form > :global(form button) {
            width: 60px;
          }

          .form > :global(label) {
            flex: 1 1 0;
            margin-left: var(--margin);
          }

          .form > :global(label:first-child) {
            margin-left: 0;
          }

          @media (max-width: 600px) {
            .form {
              flex-direction: column;
            }

            .form > :global(form) {
              margin-left: 0;
              margin-top: var(--margin);
              width: 100%;
            }

            .form > :global(label) {
              margin-left: 0;
              margin-top: var(--margin);
              width: 100%;
            }

            .form > :global(label:first-child) {
              margin-top: 0;
            }
          }
        `}</style>
      </main>
    </Page>
  );
}
