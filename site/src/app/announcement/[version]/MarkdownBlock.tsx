import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import type { ComponentPropsWithoutRef } from 'react';

const components = {
  h2: ({ children }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="text-sm font-semibold text-[#07094c] mt-6 mb-2 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="font-semibold text-[#07094c] mt-6 mb-3 first:mt-0">{children}</h3>
  ),
  h4: ({ children }: ComponentPropsWithoutRef<'h4'>) => (
    <h4 className="text-sm font-semibold text-[#07094c] mt-4 mb-2">{children}</h4>
  ),
  ul: ({ children }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc list-inside space-y-1.5 mb-5">{children}</ul>
  ),
  li: ({ children }: ComponentPropsWithoutRef<'li'>) => (
    <li className="text-sm text-[#07094c99] leading-relaxed">{children}</li>
  ),
  p: ({ children }: ComponentPropsWithoutRef<'p'>) => (
    <p className="text-sm text-[#07094c99] leading-relaxed mb-3">{children}</p>
  ),
  code: ({ children }: ComponentPropsWithoutRef<'code'>) => (
    <code className="px-1.5 py-0.5 rounded text-xs bg-[#4643df14] text-[#4643df] font-mono">{children}</code>
  ),
  hr: () => <hr className="my-6 border-[#07094c1a]" />,
  strong: ({ children }: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-[#07094c]">{children}</strong>
  ),
  a: ({ href, children }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} className="text-[#4643df] hover:underline font-medium">
      {children}
    </a>
  ),
};

export async function MarkdownBlock({ source }: { source: string }) {
  return <MDXRemote source={source} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} components={components} />;
}
