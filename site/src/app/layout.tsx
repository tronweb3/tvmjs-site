import type { Metadata } from 'next';
import { Inter, Wix_Madefor_Display } from 'next/font/google';
import './globals.css';
import { assetPath, GA_ID, SITE_URL } from '@/lib/config';

// Self-hosted at build time: next/font downloads the faces once and emits them under
// /_next/static/media, so visitors never contact Google and the CSP needs no font host.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});
const wix = Wix_Madefor_Display({ subsets: ['latin'], display: 'swap', variable: '--font-wix' });

const TITLE = 'TVMJS | The TRON Virtual Machine in TypeScript';
const OG_DESCRIPTION =
  'Run and test TRON contract bytecode in JavaScript and TypeScript, with TRON’s own opcodes, energy metering, precompiles and account model.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description:
    'TVMJS is a monorepo of modular packages that implement the TRON Virtual Machine in JavaScript and TypeScript: TRC-10 token opcodes, TRON precompiles, the multi-signature account model and energy metering.',
  keywords: [
    'TVMJS',
    'TVM',
    'TRON Virtual Machine',
    'TRON',
    'TRC-10',
    'smart contracts',
    'bytecode interpreter',
    'energy model',
    'precompiled contracts',
    'TypeScript',
    'JavaScript',
    'blockchain',
    'java-tron',
  ],
  openGraph: {
    title: TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: 'TVMJS',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: OG_DESCRIPTION,
  },
  icons: {
    // Metadata icons are not basePath-prefixed by Next either, so without assetPath these
    // would load the parent site's favicon instead of this app's own copy.
    icon: assetPath('/favicon.ico'),
    shortcut: assetPath('/favicon.ico'),
    apple: assetPath('/favicon.ico'),
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Analytics is opt-in: a fork or a local build with no NEXT_PUBLIC_GA_ID set ships no
  // tracking at all, and the connect-src/script-src allowances below are then unused.
  const analyticsEnabled = process.env.NODE_ENV === 'production' && GA_ID !== '';
  return (
    <html lang="en" className={`${inter.variable} ${wix.variable}`}>
      <head>
        {analyticsEnabled ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} />
            {/* The measurement ID travels as a data attribute so the bootstrap can stay a
                static file rather than an inline script. See public/gtag-init.js. */}
            <script async src={assetPath('/gtag-init.js')} data-ga-id={GA_ID} />
          </>
        ) : null}
        {/* viewport meta is injected automatically by Next.js — do not add manually */}

        {/*
          Security headers that can be enforced via <meta> in static HTML.
          Headers that only work as HTTP response headers (frame-ancestors,
          X-Frame-Options, X-Content-Type-Options, Permissions-Policy,
          Cross-Origin-Opener-Policy, HSTS) cannot be emitted by a static build
          and have to be configured by ops on the server serving these files.
          The repository README lists the header set to configure.
        */}

        {/* Clickjacking defence. frame-ancestors is ignored in <meta> CSP, so
            without a server header the page can be framed. Blocking script in
            <head> so it runs before anything paints. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- blocking on purpose:
            the guard has to run before the first paint, which is exactly what `next/script`
            and a deferred script cannot promise. */}
        <script src={assetPath('/frame-guard.js')} />

        {/* CSP — note: frame-ancestors is ignored in <meta> CSP (HTTP-header only).
            This site is static content only — no wallet, no RPC — so connect-src is
            limited to the analytics endpoints.

            'unsafe-inline' in script-src is NOT optional: Next.js streams the RSC
            payload through inline `self.__next_f.push(...)` scripts, so dropping it
            blocks hydration entirely and the page renders but never becomes
            interactive. Tightening this needs per-build nonces, which a static
            export cannot produce. */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "img-src 'self' data:",
            // Analytics endpoints per Google's documented GA4 policy. The wildcards are
            // not cosmetic: GA4 beacons go to a regional collector — region1..N
            // .google-analytics.com — not to www, so pinning the exact host drops every
            // hit, and a blocked beacon is invisible to the site owner. See
            // https://developers.google.com/tag-platform/security/guides/csp
            "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'none'",
          ].join('; ')}
        />

        {/* Referrer-Policy — supported as a meta tag */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body
        className="antialiased flex flex-col pb-25 md:pb-0"
        // The page backgrounds live in globals.css but their URLs depend on BASE_PATH,
        // which a stylesheet cannot know. Passing the finished url() value down as a
        // custom property keeps the rules in CSS and the base path in one place.
        style={
          {
            '--bg-home-image': `url(${assetPath('/bottom-bg.png')})`,
            '--bg-announcement-image': `url(${assetPath('/bg-announcement.svg')})`,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
