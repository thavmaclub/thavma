import { ReactNode } from 'react';

export interface JoinProps {
  error?: string;
  children: ReactNode;
}

export default function Join({ error, children }: JoinProps): JSX.Element {
  return (
    <main className='wrapper'>
      <div className='centered'>
        <header>
          <h1>T H A V M A</h1>
        </header>
        {children}
        {error && <p className='error'>{error}</p>}
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
          position: relative;
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
          margin: 0;
        }

        .error {
          margin: 12px 0 0;
          font-size: 0.875rem;
          color: var(--error);
          width: 0;
          min-width: 100%;
          max-width: 100%;
          position: absolute;
          top: ${48 + 36 + 61.75}px;
        }
      `}</style>
    </main>
  );
}
