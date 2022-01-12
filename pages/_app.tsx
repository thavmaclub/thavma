import { useCallback, useEffect, useRef, useState } from 'react';
import { AppProps } from 'next/app';
import { dequal } from 'dequal/lite';
import { useRouter } from 'next/router';

import NProgress from 'components/nprogress';

import { Code, User } from 'lib/model';
import { Theme, ThemeContext } from 'lib/context/theme';
import { AccessContext } from 'lib/context/access';
import { UserContext } from 'lib/context/user';
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
`;

const dark = `
  --primary: #fff;
  --on-primary: #000;
  --background: #000;
  --on-background: #fff; 
  --selection: #f81ce5;
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

  const [user, setUser] = useState<User>();
  const [access, setAccess] = useState<boolean | string>();
  const getUser = useCallback(async () => {
    const uid = supabase.auth.user()?.id;
    if (!uid) {
      setUser(undefined);
    } else {
      const { data } = await supabase
        .from<User>('users')
        .select()
        .eq('id', uid);
      setUser(data ? data[0] : undefined);
    }
  }, []);
  const {
    query: { code },
  } = useRouter();
  const getAccess = useCallback(async () => {
    const uid = supabase.auth.user()?.id;
    if (!uid && window.location.href.includes('#access')) {
      setAccess(undefined);
      window.analytics?.track('Login Started');
    } else if (!uid) {
      setAccess(false);
      window.analytics?.track('Login Failed');
    } else if (typeof code === 'string') {
      const { error } = await supabase
        .from<Code>('codes')
        .update({ user: uid })
        .eq('id', code);
      setAccess(error ? 'The invite code you used was invalid or had already been used by another email address. Try logging in again with a different Google account.' : true);
      window.analytics?.track(error ? 'Code Denied' : 'Code Used', { code, error });
    } else {
      const { data } = await supabase
        .from<Code>('codes')
        .select()
        .eq('user', uid);
      setAccess(!!data?.length);
      window.analytics?.track(data?.length ? 'Code Found' : 'Code Lost', { data }); 
    }
  }, [code]);
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
    void getAccess();
  }, [getAccess]);
  useEffect(() => {
    void identify();
  }, [identify]);
  useEffect(
    () =>
      supabase.auth.onAuthStateChange(() => {
        void Promise.all([getUser(), getAccess(), identify()]);
      }).data?.unsubscribe,
    [getUser, getAccess, identify]
  );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <AccessContext.Provider value={{ access, setAccess }}>
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
              --font-sans: 'Inter', -apple-system, BlinkMacSystemFont,
                'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
                'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              --font-mono: 'Hack', Menlo, Monaco, Lucida Console,
                Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono,
                Courier New, monospace;

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
      </AccessContext.Provider>
    </UserContext.Provider>
  );
}
