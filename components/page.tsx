import { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { SegmentAnalytics } from '@segment/analytics.js-core';

import segmentSnippet from 'lib/segment-snippet';
import { useTheme } from 'lib/context/theme';

declare global {
  interface Window {
    analytics?: SegmentAnalytics.AnalyticsJS;
  }
}

export interface PageProps {
  name: string;
  children: ReactNode;
}

export default function Page({
  name,
  children,
}: PageProps): JSX.Element {
  // Log the analytics page event specifying a name for easier grouping (e.g. it
  // is practically impossible to identify a page by dynamic URL alone).
  useEffect(() => {
    window.analytics?.page('', name);
  }, [name]);

  // Change the web app manifest colors based on the user's theme.
  // @see {@link https://stackoverflow.com/a/57760135/10023158}
  const { theme } = useTheme();
  const [dark, setDark] = useState<boolean>(theme === 'dark');
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    setDark(theme === 'dark' || (theme === 'system' && mq.matches));
  }, [theme]);

  return (
    <>
      <Head>
        <title>THAVMA</title>
        <meta
          name='description'
          content='Find out what’s on your next test. If your teachers won’t tell you, THAVMA will.'
        />
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1.0' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='THAVMA' />
        <meta
          property='og:description'
          content='Find out what’s on your next test. If your teachers won’t tell you, THAVMA will.'
        />
        <meta property='og:image' content='/images/hammock-app.png' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@thavmaclub' />
        <meta property='twitter:title' content='THAVMA'/>
        <meta
          property='twitter:description'
          content='Find out what’s on your next test. If your teachers won’t tell you, THAVMA will.'
        />
        <meta property='twitter:image' content='/images/hammock-app.png' />
        <link
          rel='apple-touch-icon'
          sizes='57x57'
          href='/apple-icon-57x57.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='60x60'
          href='/apple-icon-60x60.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='72x72'
          href='/apple-icon-72x72.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='76x76'
          href='/apple-icon-76x76.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='114x114'
          href='/apple-icon-114x114.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='120x120'
          href='/apple-icon-120x120.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='144x144'
          href='/apple-icon-144x144.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='152x152'
          href='/apple-icon-152x152.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-icon-180x180.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='192x192'
          href='/android-icon-192x192.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='96x96'
          href='/favicon-96x96.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link
          rel='manifest'
          href={dark ? '/dark-manifest.json' : '/manifest.json'}
        />
        <meta
          name='msapplication-TileColor'
          content={dark ? '#121212' : '#ffffff'}
        />
        <meta name='msapplication-TileImage' content='/ms-icon-144x144.png' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-title' content='Hammock' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='application-name' content='Hammock' />
        <meta name='theme-color' content={dark ? '#121212' : '#ffffff'} />
        <link rel='preconnect' href='https://segment.thavma.club' />
        <link rel='preconnect' href='https://track.thavma.club' />
      </Head>
      <Script id='segment'>{segmentSnippet}</Script>
      {children}
    </>
  );
}
