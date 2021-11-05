export default function Pin(): JSX.Element {
  return (
    <svg 
      viewBox='0 0 24 24' 
      width='16'
      height='16'
      stroke='currentColor' 
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
      shapeRendering='geometricPrecision'
      style={{ color: 'currentColor' }}
    >
      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  );
}
