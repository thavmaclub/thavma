export default function dateString(...args: ConstructorParameters<typeof Date>): string {
  return new Date(...args).toLocaleString('en', {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}
