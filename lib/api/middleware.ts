import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

export default function middleware(
  req: Req, 
  res: Res, 
  fn: (req: Req, res: Res, cb: ((r: unknown) => void)) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (r) => r instanceof Error ? reject(r) : resolve());
  });
}
