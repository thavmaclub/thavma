export interface HowToProps {
  children: JSX.Element[];
}

export default function HowTo({ children }: HowToProps): JSX.Element {
  return (
    <section>
      <ol className='wrapper'>{children}</ol>
      <style jsx>{`
        section {
          border-top: 1px solid var(--accents-2);
          padding: var(--margin) 0;
        }

        section ol {
          padding-left: 48px;
        }

        section ol :global(li) {
          margin: 8px 0;
          font-style: italic;
          color: var(--accents-5);
        }

        section ol :global(li.loading) {
          height: 54px;
          margin-left: -24px;
          list-style: none;
        }
      `}</style>
    </section>
  );
}
