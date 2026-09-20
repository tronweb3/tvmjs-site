'use client';
/* eslint-disable @next/next/no-img-element -- announcement logos are arbitrary
   author-supplied paths of unknown intrinsic size, and `images.unoptimized` is on for the
   static export, so next/image would add layout constraints without optimising anything. */
import Link from 'next/link';
import { ReactNode } from 'react';
import { Container } from '@/components/common';
import { ANNOUNCEMENTS, getAnnouncementDetailHref, getReleaseNoteHref } from '../announcements';
import '../page.css';

const isDev = process.env.NODE_ENV === 'development';

export function AnnouncementDetailContent({
  version,
  newerVersion,
  olderVersion,
  children,
}: {
  version: string;
  newerVersion?: string;
  olderVersion?: string;
  children?: ReactNode;
}) {
  const item = ANNOUNCEMENTS.find((a) => a.version === version)!;
  const newer = newerVersion ? ANNOUNCEMENTS.find((a) => a.version === newerVersion) : undefined;
  const older = olderVersion ? ANNOUNCEMENTS.find((a) => a.version === olderVersion) : undefined;
  const releaseNoteHref = getReleaseNoteHref();
  const backHref = isDev ? '/announcement' : '/announcement.html';

  return (
    <Container paddingTop="50px" paddingBottom="50px" minHeight="600px">
      <div className="flex flex-col w-full md:w-[760px] lg:w-[900px] mx-auto px-5 md:px-0">
        <Link
          href={backHref}
          className="self-start inline-flex items-center gap-1 text-sm text-[#4643df] hover:underline mb-6 md:mb-8"
        >
          ← Back to Announcements
        </Link>

        <div className="flex items-center justify-center gap-3 mb-3">
          <time className="text-sm text-[#07094c99]">{item.time}</time>
          <span className="text-[13px] px-2 py-0.5 rounded-md bg-[#4643df1a] text-[#4643df] font-semibold">
            v{item.version}
          </span>
        </div>

        <h1 className="font-wix font-extrabold text-[28px] md:text-[40px] leading-tight text-[#07094c] text-center mb-6">
          {item.title}
        </h1>

        {item.imgList && item.imgList.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {item.imgList.map((src) => (
              <img key={src} src={src} alt="" className="h-16 md:h-20" />
            ))}
          </div>
        )}

        {children ? (
          <div className="mb-0">{children}</div>
        ) : (
          <div className="announcement-content text-[16px] md:text-[18px] leading-7 md:leading-8 text-[#07094c99]">
            {item.content}
          </div>
        )}

        <a
          href={releaseNoteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="self-end inline-flex items-center text-sm text-[#4643df] font-bold leading-9 px-4 mt-0 rounded-md bg-[#4643df1a] hover:bg-[#4643df33] transition-all duration-300"
        >
          View Release Note on GitHub →
        </a>

        {(newer || older) && (
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-8 pt-6 border-t border-[#07094c33]">
            <div className="md:max-w-[45%]">
              {newer ? (
                <Link href={getAnnouncementDetailHref(newer.version, isDev)} className="group block">
                  <div className="text-xs text-[#07094c66] mb-1">← Newer</div>
                  <div className="text-sm text-[#07094c] font-semibold group-hover:text-[#4643df] transition-colors">
                    {newer.title}
                  </div>
                </Link>
              ) : null}
            </div>
            <div className="md:max-w-[45%] md:text-right">
              {older ? (
                <Link href={getAnnouncementDetailHref(older.version, isDev)} className="group block">
                  <div className="text-xs text-[#07094c66] mb-1">Older →</div>
                  <div className="text-sm text-[#07094c] font-semibold group-hover:text-[#4643df] transition-colors">
                    {older.title}
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
