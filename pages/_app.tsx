import { useCallback, useEffect, useRef, useState } from 'react';
import { AppProps } from 'next/app';
import { dequal } from 'dequal/lite';
import { useRouter } from 'next/router';

import NProgress from 'components/nprogress';

import { Code, User } from 'lib/model';
import { Theme, ThemeContext } from 'lib/context/theme';
import { UserContext } from 'lib/context/user';
import log from 'lib/log';
import supabase from 'lib/supabase';

import 'fonts/hack-subset.css';

const light = `
  --primary: #000;
  --on-primary: #fff;
  --background: #fff;
  --on-background: #000;
  --selection: #79ffe1;
  --on-selection: #000;
  --error: #b00020;
  --on-error: #fff;
  --warning: #f5a623;

  --accents-1: #fafafa;
  --accents-2: #eaeaea;
  --accents-3: #999;
  --accents-4: #888;
  --accents-5: #666;
  --accents-6: #444;
  --accents-7: #333;
  --accents-8: #111;
  
  --shadow-small: 0 5px 10px rgba(0, 0, 0, 0.12);
  --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.12);
  --shadow-large: 0 30px 60px rgba(0, 0, 0, 0.12);
`;

const dark = `
  --primary: #fff;
  --on-primary: #000;
  --background: #000;
  --on-background: #fff; 
  --selection: #09a381;
  --on-selection: #fff;

  --accents-1: #111;
  --accents-2: #333;
  --accents-3: #444;
  --accents-4: #666;
  --accents-5: #888;
  --accents-6: #999;
  --accents-7: #eaeaea;
  --accents-8: #fafafa;
`;

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.remove('system');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('system');
    } else {
      document.documentElement.classList.add('system');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  useEffect(() => {
    setTheme((prev) => (localStorage.getItem('theme') as Theme) || prev);
  }, []);
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const { query, isReady } = useRouter();
  // null - User does not exist (code invalid; redirect to /join).
  // undefined - User has yet to be loaded (show fallback state).
  // user - User exists (redirect to /pay if user.access = false).
  const [user, setUser] = useState<User | null>();
  const getUser = useCallback(async () => {
    const uid = supabase.auth.user()?.id;
    if (!uid && window.location.href.includes('#access')) {
      setUser(undefined);
      log.debug('Logging in... (show fallback)');
    } else if (!uid) {
      log.debug('Not logged in and not logging in (go to /join)');
      setUser(null);
    } else {
      const { data } = await supabase
        .from<User>('users')
        .select()
        .eq('id', uid);
      if (data?.length) {
        log.debug('Logged in and user exists (go to /pay if !access)');
        setUser(data[0]);
      } else if (isReady && typeof query.code !== 'string') {
        log.debug('Logged in but user and code missing (go to /join)');
        setUser(null);
      } else if (isReady && typeof query.code === 'string') {
        log.debug('Signing up... (verify invite code and create user row)');
        const { error } = await supabase
          .from<Code>('codes')
          .update({ user: uid })
          .eq('id', query.code);
        if (error) {
          log.debug('Code invalid or already used (go to /join)');
          setUser(null);
        } else {
          log.debug('Code worked; create user row (go to /pay if !access)');
          const { data: created } = await supabase
            .from<User>('users')
            .insert({ id: uid, access: false });
          setUser(created?.length ? created[0] : undefined);
        }
      }
    }
  }, [query.code, isReady]);
  const prevIdentity = useRef<Record<string, unknown>>();
  const identify = useCallback(() => {
    const usr = supabase.auth.user();
    const identity = {
      id: usr?.id,
      email: usr?.email,
      phone: user?.phone,
      createdAt: usr?.created_at,
      avatar: usr?.user_metadata.picture as string,
      // We have to specify the `$avatar` trait separately for Mixpanel because
      // Segment doesn't translate it's `avatar` trait to the special Mixpanel
      // one. This is a limitation of theirs that shouldn't exist.
      $avatar: usr?.user_metadata.picture as string,
      name: usr?.user_metadata.name as string,
    };
    if (dequal(prevIdentity.current, identity)) return;
    if (identity.id && identity.id !== prevIdentity.current?.id)
      window.analytics?.alias(identity.id);
    window.analytics?.identify(identity.id, identity);
    prevIdentity.current = identity;
  }, [user]);
  useEffect(() => {
    void getUser();
  }, [getUser]);
  useEffect(() => {
    void identify();
  }, [identify]);
  useEffect(
    () =>
      supabase.auth.onAuthStateChange(() => {
        void Promise.all([getUser(), identify()]);
      }).data?.unsubscribe,
    [getUser, identify]
  );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <NProgress />
        <Component {...pageProps} />
        <style jsx global>{`
          ::selection {
            background-color: var(--selection);
            color: var(--on-selection);
          }

          *,
          *:before,
          *:after {
            box-sizing: inherit;
          }

          html {
            height: 100%;
            box-sizing: border-box;
            touch-action: manipulation;
            font-feature-settings: 'kern';
          }

          body {
            margin: 0;
            padding: 0;
          }

          html,
          body {
            font-size: 12px;
            line-height: 1.5;
            font-family: var(--font-mono);
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: subpixel-antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: var(--background);
            color: var(--on-background);
          }

          .wrapper {
            max-width: calc(var(--page-width) + 48px);
            padding: 0 24px;
            margin: 0 auto;
          }

          .nowrap {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .loading {
            border-radius: var(--radius);
            background-image: linear-gradient(
              270deg,
              var(--accents-1),
              var(--accents-2),
              var(--accents-2),
              var(--accents-1)
            );
            background-size: 400% 100%;
            -webkit-animation: loadingAnimation 8s ease-in-out infinite;
            animation: loadingAnimation 8s ease-in-out infinite;
            cursor: wait;
          }

          @keyframes loadingAnimation {
            0% {
              background-position: 200% 0;
            }
            to {
              background-position: -200% 0;
            }
          }
        `}</style>
        <style jsx global>{`
          :root {
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
              'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
              'Droid Sans', 'Helvetica Neue', sans-serif;
            --font-mono: 'Hack', Menlo, Monaco, Lucida Console, Liberation Mono,
              DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;

            --page-width: 800px;
            --radius: 6px;
            --margin: 12px;

            ${light}
          }
          @media (prefers-color-scheme: light) {
            :root {
              ${light}
            }
          }
          @media (prefers-color-scheme: dark) {
            :root {
              ${dark}
            }
          }
          .light {
            ${light}
          }
          .dark {
            ${dark}
          }
        `}</style>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
