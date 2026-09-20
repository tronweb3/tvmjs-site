import { PropsWithChildren } from 'react';

export function LinkButton({
  href,
  children,
  target,
  className,
  dataAnimateIndex,
}: PropsWithChildren<{ href: string; target: string; className?: string; dataAnimateIndex?: string }>) {
  return (
    <a
      href={href}
      target={target}
      rel="noopener noreferrer"
      data-animate-index={dataAnimateIndex}
      className={
        'relative inline-flex justify-center items-center leading-7 text-xs md:text-sm md:leading-10 text-center rounded-md h-7 md:h-10 font-semibold text-white shadow-bl' +
        ' ' +
        className
      }
    >
      {children}
    </a>
  );
}
