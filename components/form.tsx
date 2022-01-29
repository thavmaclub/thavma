import { ReactNode } from 'react';

export interface FormProps {
  children: ReactNode;
}

export default function Form({ children }: FormProps): JSX.Element {
  return (
    <div className='wrapper'>
      {children}
      <style jsx>{`
        div {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 24px auto;
        }

        div > :global(form) {
          margin-top: -${12 * 0.875 * 1.5 + 6}px;
          margin-left: var(--margin);
          flex: 1.5 1 0;
        }

        div > :global(label) {
          flex: 1 1 0;
          margin-left: var(--margin);
        }

        div > :global(label:first-child) {
          margin-left: 0;
        }

        @media (max-width: 600px) {
          div {
            flex-direction: column;
          }

          div > :global(form) {
            margin-left: 0;
            margin-top: var(--margin);
            width: 100%;
          }

          div > :global(label) {
            margin-left: 0;
            margin-top: var(--margin);
            width: 100%;
          }

          div > :global(label:first-child) {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
