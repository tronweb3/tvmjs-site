import { PropsWithChildren } from 'react';
import { NavBar } from './NavBar';
import { Footer } from './Footer';

export function CommonLayout({
  pathname,
  children,
  className,
}: PropsWithChildren<{ pathname: string; className: string }>) {
  return (
    <div className={className}>
      <NavBar pathname={pathname} />
      <main className="scroll-smooth">{children}</main>
      <Footer />
    </div>
  );
}
