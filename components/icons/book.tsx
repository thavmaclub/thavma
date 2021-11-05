export default function Book(): JSX.Element {
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
      <path d='M4 19.5A2.5 2.5 0 016.5 17H20' />
      <path d='M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z' />
    </svg>
  );
}
