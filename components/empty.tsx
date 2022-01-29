import { ReactNode } from 'react';

export interface EmptyProps {
  children: ReactNode;
}

export default function Empty({ children }: EmptyProps): JSX.Element {
  return (
    <div>
      {children}
      <style jsx>{`
        div {
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
      `}</style>
    </div>
  );
}
