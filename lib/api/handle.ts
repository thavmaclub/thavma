import { ServerResponse } from 'http';

import { APIError } from 'lib/model';
import log from 'lib/log';

function send(e: APIError, res: ServerResponse): void {
  const stringified = JSON.stringify({ message: e.message, code: e.code });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(stringified));
  res.statusCode = e.code;
  res.end(stringified);
}

export default function handle(e: unknown, res: ServerResponse): void {
  if (!(e instanceof APIError) || e.code !== 401) {
    log.error(`API: ${(e as Error)?.stack || ''}`);
  } else {
    log.error(`API ${e.code}: ${e.toString()}`);
  }
  if (e instanceof APIError) return send(e, res);
  if (e instanceof Error) return send(new APIError(e.message, 500), res);
  if (typeof e === 'string') return send(new APIError(e, 500), res);
  return send(new APIError('Unknown error', 500), res);
}
