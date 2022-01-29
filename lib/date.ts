export default function dateString(...args: Parameters<typeof Date>): string {
  return new Date(...args).toLocaleString('en', {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}
