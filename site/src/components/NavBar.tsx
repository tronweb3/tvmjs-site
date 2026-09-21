'use client';
import { Button, Drawer, styled } from '@mui/material';
import { useLayoutEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { NAV_LIST, NavItem, isNavGroup, isActivePath, assetPath, withBasePath, PARENT_ROOT, BRAND } from '@/lib/config';
import Link from 'next/link';
import { HTMLAttributeAnchorTarget } from 'react';

interface NavButtonProps {
  pathname: string;
  href: string;
  target?: HTMLAttributeAnchorTarget;
  children: React.ReactNode;
  className?: string;
  width?: string;
  /** Closes the mobile drawer after a tap; unused on desktop. */
  onNavigate?: () => void;
  /** Render a plain <a>; see NavItem.external. */
  external?: boolean;
}

/** Pixels of scroll over which the nav background fades from transparent to opaque. */
const NAV_FADE_DISTANCE = 80;

const PageTitle = styled('h1')(() => ({
  fontFamily: 'Wix Madefor Display',
  fontWeight: 700,
  fontSize: '20px',
  lineHeight: '100%',
  letterSpacing: '0px',
  verticalAlign: 'middle',
  display: 'flex',
  alignItems: 'center',
  img: {
    marginRight: '10px',
  },
  '@media (max-width: 768px)': {
    fontSize: '12px',
    marginLeft: '28px',
    img: {
      width: '16px',
      height: '16px',
    },
  },
}));

const MenuButton = styled(Button)(() => ({
  position: 'absolute',
  right: '0',
  '@media (min-width: 768px)': {
    display: 'none',
  },
}));

export function NavBar({ pathname }: { pathname: string }) {
  useLayoutEffect(() => {
    const navbar = document.getElementById('nav-bar');
    if (!navbar) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      // 0 at the top of the page, 1 once scrolled past the fade distance.
      const progress = Math.min(window.scrollY / NAV_FADE_DISTANCE, 1);
      navbar.style.setProperty('--nav-bg-opacity', progress.toFixed(3));
    };

    const onScroll = () => {
      // Coalesce a burst of scroll events into a single write per frame.
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // Run once on mount: reloading part-way down the page must not start transparent.
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const NavContent = useMemo(() => {
    // The gap to the logo lives on this container rather than on the first item, so it
    // can be tuned without disturbing the 64px rhythm between the items themselves.
    return (
      <div className="hidden md:flex items-center h-full md:ml-32 xl:ml-40">
        {NAV_LIST.map((entry) => {
          if (isNavGroup(entry)) {
            return (
              <NavDropdown
                key={entry.title}
                pathname={pathname}
                title={entry.title}
                width={entry.width}
                items={entry.children}
              />
            );
          }
          const { path, target, title, width, external } = entry;
          return (
            <NavButton
              className="h-full"
              pathname={pathname}
              key={path}
              href={path}
              target={target}
              width={width}
              external={external}
            >
              {title}
            </NavButton>
          );
        })}
      </div>
    );
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const MobileNavContent = useMemo(() => {
    return (
      <Drawer className="w-full md:hidden" anchor="top" open={open} onClose={() => setOpen(false)}>
        <div
          className="flex flex-col items-center py-8 border-b-[1px] border-solid"
          style={{ borderColor: 'rgba(7, 9, 76, 0.1)' }}
        >
          {NAV_LIST.map((entry) => {
            if (isNavGroup(entry)) {
              return (
                <div key={entry.title} className="w-full flex flex-col items-center">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#07094c66] font-semibold mb-4">
                    {entry.title}
                  </div>
                  {entry.children.map(({ path, target, title }) => (
                    <NavButton
                      pathname={pathname}
                      key={path}
                      href={path}
                      target={target}
                      onNavigate={() => setOpen(false)}
                    >
                      {title}
                    </NavButton>
                  ))}
                </div>
              );
            }
            const { path, target, title, external } = entry;
            return (
              <NavButton
                pathname={pathname}
                key={path}
                href={path}
                target={target}
                external={external}
                onNavigate={() => setOpen(false)}
              >
                {title}
              </NavButton>
            );
          })}
        </div>
      </Drawer>
    );
  }, [open, setOpen, pathname]);

  const handleDrawerToggle = () => {
    setOpen(true);
  };

  return (
    <header className="font-wix sticky top-0 z-10" id="nav-bar">
      {/* Fades in with scroll; see #nav-bar .nav-bg in globals.css. */}
      <div className="nav-bg" aria-hidden />
      <div className="relative flex h-[50px] md:h-16 items-center w-[100vw] md:w-[1200px] xl:w-[1360px] md:px-4 xl:px-0 m-auto">
        {/* Logo and nav sit together on the left. `mr-auto` pushes the remaining
            space to the right instead of spreading the items across the bar. */}
        {/* The logo and title lead out to the parent site at the origin root. A plain <a>,
            not next/link: Link would prefix basePath and stay inside this site. */}
        <a href={PARENT_ROOT} className="no-underline shrink-0">
          <PageTitle>
            <Image src={assetPath('/logo.png')} alt="" width={24} height={24} />
            <span>{BRAND}</span>
          </PageTitle>
        </a>
        {MobileNavContent}
        {NavContent}
        <div className="mr-auto" />
        <MenuButton onClick={handleDrawerToggle}>
          <Image src={assetPath('/img-menu.svg')} alt="menu" width={20} height={14} />
        </MenuButton>
      </div>
    </header>
  );
}

function NavButton({
  className = '',
  pathname,
  href,
  target = '_self',
  children,
  width,
  onNavigate,
  external,
}: NavButtonProps) {
  const active = isActivePath(pathname, href);
  // next/link prefixes basePath for both, but only Link attempts client-side routing,
  // which a non-Next destination cannot serve.
  const Anchor = external ? 'a' : Link;
  const anchorHref = external ? withBasePath(href) : href;
  // A single anchor, not an <a> wrapping a <button>: interactive content is not allowed
  // inside a link, and the nesting gave the row two focusable elements.
  return (
    <Anchor
      href={anchorHref}
      target={target}
      onClick={onNavigate}
      data-id={href}
      aria-current={active ? 'page' : undefined}
      style={{ width }}
      className={`relative ml-0 md:first:ml-0 md:ml-16 mb-10 md:mb-0 last:mb-0 inline-flex items-center justify-center cursor-pointer font-medium hover:text-[#07094c] hover:font-semibold ${
        active ? 'text-[#07094c] font-semibold' : 'text-[#07094c99] font-medium'
      } ${className}`}
    >
      {children}
    </Anchor>
  );
}

function NavDropdown({
  pathname,
  title,
  width,
  items,
}: {
  pathname: string;
  title: string;
  width?: string;
  items: NavItem[];
}) {
  const isActive = items.some((item) => isActivePath(pathname, item.path));
  return (
    <div className="group relative ml-0 md:first:ml-0 md:ml-16 h-full">
      <button
        type="button"
        style={{ width }}
        className={`relative cursor-pointer font-medium hover:text-[#07094c] hover:font-semibold h-full inline-flex items-center gap-1 ${
          isActive ? 'text-[#07094c] font-semibold' : 'text-[#07094c99] font-medium'
        }`}
      >
        {title}
        <svg
          className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="min-w-[180px] rounded-lg border border-[#07094c14] bg-white shadow-[0_12px_32px_rgba(7,9,76,0.12)] py-2">
          {items.map(({ path, target, title: itemTitle }) => {
            const active = isActivePath(pathname, path);
            return (
              <Link
                key={path}
                href={path}
                target={target || '_self'}
                aria-current={active ? 'page' : undefined}
                className={`block px-4 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#4643df0f] ${
                  active
                    ? 'text-[#07094c] font-semibold'
                    : 'text-[#07094c99] font-medium hover:text-[#07094c] hover:font-semibold'
                }`}
              >
                {itemTitle}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
