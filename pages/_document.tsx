import NextDocument, { Head, Html, Main, NextScript } from 'next/document';

const themeSnippet = `document.documentElement.classList.add(localStorage.getItem('theme') || 'system');`;

// Prevent FOUC on Firefox due to an age-old script processing bug.
// @see {@link https://nextjs.org/docs/advanced-features/custom-document}
// @see {@link https://github.com/vercel/next.js/issues/22465}
export default class Document extends NextDocument {
  public render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link
            rel='preload'
            href='/fonts/hack-regular-subset.woff2'
            crossOrigin='anonymous'
            type='font/woff2'
            as='font'
          />
          <link
            rel='preload'
            href='/fonts/hack-bold-subset.woff2'
            crossOrigin='anonymous'
            type='font/woff2'
            as='font'
          />
          <link
            rel='preload'
            href='/fonts/hack-italic-subset.woff2'
            crossOrigin='anonymous'
            type='font/woff2'
            as='font'
          />
          <link
            rel='preload'
            href='/fonts/hack-bolditalic-subset.woff2'
            crossOrigin='anonymous'
            type='font/woff2'
            as='font'
          />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: themeSnippet }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
