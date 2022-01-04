export default function Header(): JSX.Element {
  return (
    <header className='wrapper'>
      <h1>T H A V M A</h1>
      <style jsx>{`
        header {
          text-align: center;
          margin: 48px auto;
        }

        h1 {
          font-size: 36px;
          line-height: 1;
          margin: 0;
        }

        @media (max-width: 400px) {
          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </header>
  );
}
