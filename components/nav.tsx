import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { useRouter } from 'next/router';

import fetcher from 'lib/fetch';
import useNProgress from 'lib/nprogress';
import { useUser } from 'lib/context/user';

interface NavLinkProps {
  href: string;
  children: string;
  setActive?: Dispatch<SetStateAction<{ x: number; width: number }>>;
}

function NavLink({ href, children, setActive }: NavLinkProps): JSX.Element {
  const { pathname } = useRouter();
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (pathname === href && ref.current && setActive)
      setActive({ x: ref.current.offsetLeft, width: ref.current.clientWidth });
  }, [pathname, href, setActive]);

  return (
    <li ref={ref}>
      <Link href={href}>
        <a
          rel={!href.startsWith('/') ? 'noopener noreferrer' : undefined}
          target={!href.startsWith('/') ? '_blank' : undefined}
          className={cn({ active: pathname === href })}
        >
          {children}
        </a>
      </Link>
      <style jsx>{`
        li {
          display: inline-block;
          margin: 0 0.5rem;
          float: none;
        }

        li:first-of-type {
          margin-left: 0;
        }

        li:last-of-type {
          margin-right: 0;
        }

        a {
          display: block;
          line-height: 24px;
          padding: 0.5rem 0;
          cursor: pointer;
          text-decoration: none;
          color: var(--accents-5);
          transition: color 0.2s ease 0s;
        }

        a:hover,
        a.active {
          color: var(--on-background);
        }

        @media (max-width: 800px) {
          li {
            white-space: nowrap;
          }

          li:first-of-type {
            margin-left: 0;
          }

          li:last-of-type {
            margin-right: 1rem;
          }
        }
      `}</style>
    </li>
  );
}

export interface NavProps {
  active: { x: number; width: number };
  setActive: Dispatch<SetStateAction<{ x: number; width: number }>>;
}

export default function Nav({ active, setActive }: NavProps): JSX.Element {
  const [visible, setVisible] = useState<boolean>(true);
  const lastScrollPosition = useRef<number>(0);

  useEffect(() => {
    function handleScroll(): void {
      const currentScrollPosition = window.pageYOffset;
      const prevScrollPosition = lastScrollPosition.current;
      lastScrollPosition.current = currentScrollPosition;
      setVisible(() => {
        const scrolledUp = currentScrollPosition < prevScrollPosition;
        const scrolledToTop = currentScrollPosition < 10;
        return scrolledUp || scrolledToTop;
      });
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { setUser } = useUser();
  const { replace, pathname } = useRouter();
  const { loading, setLoading } = useNProgress();
  const onClick = useCallback(
    async (evt: FormEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
      setLoading(true);
      const msg =
        'Do you really want to cancel your THAVMA subscription? If you do, you ' +
        'will immediately lose access to all of THAVMA and will have to ' +
        'restart your subscription—paying yet another $10—to regain access. ' +
        '\n\nClick "OK" to cancel or "CANCEL" to keep your subscription:';
      if (window.confirm(msg)) {
        try {
          await fetcher('/api/cancel');
          setUser((prev) => (prev ? { ...prev, access: false } : prev));
          await replace('/pay'); // Page change calls getUser()
        } catch (e) {
          setLoading(false);
          window.alert(
            `Could not cancel subscription: ${(e as Error).message}`
          );
        }
      } else {
        setLoading(false);
      }
    },
    [setLoading, setUser, replace]
  );

  return (
    <nav className={cn({ visible })}>
      <div className='scrim' />
      <ul>
        {!!active.width && (
          <div
            className='bar'
            style={{
              opacity: ['/', '/assessments'].includes(pathname) ? 1 : 0,
            }}
          />
        )}
        <NavLink href='/' setActive={setActive}>
          index
        </NavLink>
        <NavLink href='/assessments' setActive={setActive}>
          assessments
        </NavLink>
        <button type='button' disabled={loading} onClick={onClick}>
          cancel subscription
        </button>
      </ul>
      <style jsx>{`
        button {
          border: unset;
          appearance: unset;
          cursor: pointer;
          margin: 0 0.5rem;
          font: inherit;
          background: unset;
          padding: unset;
          color: var(--accents-5);
          transition: color 0.2s ease 0s;
        }

        button:hover,
        button:focus {
          color: var(--on-background);
        }

        button:first-of-type {
          margin-left: auto;
        }

        button:last-of-type {
          margin-right: 0;
        }

        nav {
          box-shadow: inset 0 -1px var(--accents-2);
          backdrop-filter: saturate(180%) blur(2px);
          position: fixed;
          z-index: 4;
          top: -20px;
          left: 0;
          right: 0;
          opacity: 0;
          transition: top 0.2s ease 0s, opacity 0.2s ease 0s;
        }

        nav.visible {
          opacity: 1;
          top: 0;
        }

        .scrim {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 1px;
          width: 100%;
          background: var(--background);
          opacity: 0.85;
          z-index: -1;
        }

        ul {
          list-style: none;
          max-width: calc(var(--page-width) + 2 * 24px);
          padding: 0 24px;
          margin: 0 auto;
          position: relative;
          width: 100%;
          display: flex;
        }

        .bar {
          height: 2px;
          background: var(--on-background);
          position: absolute;
          left: 9px;
          bottom: 0;
          transition: 150ms ease;
          transition-property: width, transform;
          transform: translateX(${active.x - 8}px);
          width: ${active.width}px;
        }

        @media (max-width: 500px) {
          nav {
            max-width: 100%;
            margin: auto;
            align-items: flex-end;
            overflow: auto;
            scrollbar-width: none;
            justify-content: flex-start;
          }

          ul {
            display: flex;
            flex-grow: 1;
            transform: translateZ(0);
            margin-right: 0;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
}
