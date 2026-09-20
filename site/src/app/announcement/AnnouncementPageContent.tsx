'use client';
/* eslint-disable @next/next/no-img-element -- announcement logos are arbitrary
   author-supplied paths of unknown intrinsic size, and `images.unoptimized` is on for the
   static export, so next/image would add layout constraints without optimising anything. */
import { useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Title } from '@/components/common';
import './page.css';
import { LinkButton } from '@/components/home/LinkButton';
import { GITHUB_URL } from '@/lib/config';
import { ANNOUNCEMENTS, AnnouncementItem, getAnnouncementDetailHref, getReleaseNoteHref } from './announcements';

const PAGE_SIZE = 5;
const isDev = process.env.NODE_ENV === 'development';

export function AnnouncementPageContent() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(ANNOUNCEMENTS.length / PAGE_SIZE);
  const pageAnnouncements = ANNOUNCEMENTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container paddingTop="50px" paddingBottom="80px" minHeight="600px">
      <div className="flex flex-col w-full lg:w-[1200px] mx-auto md:h-full grow flex-auto px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <Title textAlign="left">Announcements</Title>
            <p className="text-[13px] md:text-[15px] text-[#07094c99] mt-2 max-w-xxl leading-relaxed">
              Release notes and project updates from the TVMJS team.
            </p>
          </div>
          <LinkButton className="blue-button w-44" href={GITHUB_URL} target="_blank">
            View on GitHub →
          </LinkButton>
        </div>

        <div className="flex-auto grow">
          <div className="flex flex-col gap-4 md:gap-5 mt-5">
            {pageAnnouncements.map((props, idx) => (
              <AnnouncementCard key={props.version + idx} {...props} />
            ))}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </Container>
  );
}

function FeaturedAnnouncement({ time, title, content, imgList, version }: AnnouncementItem) {
  const detailHref = getAnnouncementDetailHref(version, isDev);
  return (
    <div className="announcement-featured relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-8 mb-4 md:mb-6">
      <span id={`v${version}`} className="absolute -top-20"></span>
      <div className="announcement-featured-glow announcement-featured-glow--a" aria-hidden></div>
      <div className="announcement-featured-glow announcement-featured-glow--b" aria-hidden></div>

      <div className="relative flex items-start gap-4 md:gap-5 mb-3">
        {imgList && imgList.length > 0 && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {imgList.map((img) => (
              <div
                key={img}
                className="h-12 sm:h-14 md:h-16 w-12 sm:w-14 md:w-16 flex items-center justify-center rounded-2xl bg-white border border-[#4643df1a] shadow-[0_8px_24px_rgba(70,67,223,0.14)]"
              >
                <img src={img} className="h-7 sm:h-8 md:h-10" alt="" />
              </div>
            ))}
          </div>
        )}
        <Link
          href={detailHref}
          className="text-[18px] sm:text-[22px] md:text-[28px] leading-tight font-bold text-[#07094c] hover:text-[#4643df] transition-colors wrap-break-word"
        >
          {title}
        </Link>
      </div>

      <div className="relative flex items-center flex-wrap gap-x-2 gap-y-1 sm:gap-3 mb-2 sm:mb-3">
        <span className="text-[14px] sm:text-[16px] md:text-[18px] font-bold text-[#4643df] tracking-tight font-mono">
          v{version}
        </span>
        <span className="text-[#07094c33]" aria-hidden>
          ·
        </span>
        <time className="text-[12px] sm:text-[13px] md:text-sm text-[#07094cb3]">{time}</time>
        <span className="text-[#07094c33]" aria-hidden>
          ·
        </span>
        <Link
          href={detailHref}
          className="text-[12px] sm:text-[13px] md:text-sm font-semibold text-[#4643df] hover:text-[#2e2bc8] inline-flex items-center gap-1 group/link"
        >
          Details
          <span className="transition-transform group-hover/link:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
      </div>

      <div className="relative announcement-content text-[13px] sm:text-[14px] md:text-[16px] leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function AnnouncementCard({ time, title, content, imgList, version }: AnnouncementItem) {
  const detailHref = getAnnouncementDetailHref(version, isDev);
  const router = useRouter();
  const handleClick = useCallback(() => router.push(detailHref), [router, detailHref]);
  return (
    <article
      onClick={handleClick}
      className="announcement-card group relative rounded-xl border border-[#07094c1a] bg-white/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-[#4643df66] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(70,67,223,0.1)] cursor-pointer"
    >
      <span id={`v${version}`} className="absolute -top-20"></span>

      <div className="flex items-center gap-3 mb-2">
        {imgList && imgList.length > 0 && (
          <div className="flex gap-2 shrink-0">
            {imgList.map((img) => (
              <div
                key={img}
                className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-xl bg-[#f5f5fb] border border-transparent group-hover:bg-white group-hover:border-[#4643df1a] group-hover:shadow-[0_4px_14px_rgba(70,67,223,0.1)] transition-all"
              >
                <img src={img} className="h-6 w-6 sm:h-7 sm:w-7" alt="" />
              </div>
            ))}
          </div>
        )}
        {/* A real link, so the card is reachable and openable from the keyboard. The card's
            onClick stays for mouse convenience; stopPropagation keeps a click on the title
            from navigating twice. */}
        <Link
          href={detailHref}
          onClick={(e) => e.stopPropagation()}
          className="text-[15px] sm:text-[16px] md:text-[20px] leading-snug font-bold text-[#07094c] group-hover:text-[#4643df] transition-colors wrap-break-word focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4643df] rounded-sm"
        >
          {title}
        </Link>
      </div>

      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 sm:gap-2.5 md:gap-2 mb-2 md:mb-3">
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#4643df14] text-[#4643df] text-[12px] md:text-[13px] font-bold font-mono">
          v{version}
        </span>
        <time className="text-[12px] md:text-sm text-[#07094c99]">{time}</time>
        <span
          className="ml-auto text-[12px] md:text-sm font-semibold text-[#4643df] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-hidden
        >
          View Details
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>

      <div className="announcement-content leading-relaxed text-[13px] md:text-[15px]">{content}</div>
    </article>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap justify-center items-center mt-8 sm:mt-10 md:mt-12 gap-1 sm:gap-1.5">
      <PageButton disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        ‹
      </PageButton>
      {[...Array(totalPages)].map((_, i) => (
        <PageButton key={i} active={page === i + 1} onClick={() => onPageChange(i + 1)}>
          {i + 1}
        </PageButton>
      ))}
      <PageButton disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        ›
      </PageButton>
    </div>
  );
}

function PageButton({
  active,
  disabled,
  onClick,
  children,
  ...rest
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  'aria-label'?: string;
}) {
  const base =
    'min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all select-none';
  const stateClass = active
    ? 'bg-[#4643df] text-white shadow-md shadow-[#4643df40]'
    : 'bg-white border border-[#07094c1a] text-[#07094c] hover:border-[#4643df66] hover:text-[#4643df]';
  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer';
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${stateClass} ${disabledClass}`} {...rest}>
      {children}
    </button>
  );
}
