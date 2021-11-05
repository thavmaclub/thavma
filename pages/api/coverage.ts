import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

/**
 * GET - Fetches the server-side code coverage.
 *
 * This API endpoint is used during development by the `@cypress/code-coverage`
 * plugin to get the results of the server-side Istanbul code instrumentation.
 *
 * The endpoint just returns the existing global coverage object or `null`.
 *
 * @see {@link https://nextjs.org/docs#api-routes}
 * @see {@link https://github.com/cypress-io/code-coverage}
 * @see {@link https://github.com/bahmutov/next-and-cypress-example}
 * @see {@link https://github.com/lluia/cypress-typescript-coverage-example}
 */
export default function coverageAPI(req: Req, res: Res): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    /* eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
    res.status(200).json({ coverage: (global as any).__coverage__ || null });
  }
}
