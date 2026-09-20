import { Container, Title } from '@/components/common';
import { GITHUB_URL, ISSUE_URL } from '@/lib/config';
import { sortedMilestones, STATUS_LABEL, type MilestoneStatus } from './milestones';

const STATUS_CLASS: Record<MilestoneStatus, string> = {
  released: 'bg-[#e8f8f0] text-[#0e8a5f]',
  'in-progress': 'bg-[#fff4e0] text-[#b46f00]',
  planned: 'bg-[#eeeef8] text-[#5a5a8f]',
};

/**
 * Milestone copy is authored as plain strings with `backticks` around identifiers, the
 * way the announcement markdown does it, so the data file stays free of markup. This is
 * the only place that turns those spans into elements.
 */
function withInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
      <code key={index} className="px-1.5 py-0.5 rounded text-[13px] bg-[#4643df14] text-[#4643df] font-mono">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  );
}

const MARKER_CLASS: Record<MilestoneStatus, string> = {
  released: 'bg-[#0e8a5f]',
  'in-progress': 'bg-[#e5a13a]',
  planned: 'bg-[#c5c5dd]',
};

export function RoadmapPageContent() {
  return (
    <Container paddingTop="50px" paddingBottom="80px" minHeight="600px">
      <div className="flex flex-col w-full lg:w-[1200px] mx-auto grow px-4 md:px-0 font-wix">
        <div className="mb-8 md:mb-12">
          <Title textAlign="left">Roadmap</Title>
          <p className="text-[13px] md:text-[15px] text-[#07094c99] mt-2 max-w-2xl leading-relaxed">
            Where TVMJS is heading, quarter by quarter. Details are filled in as each milestone is planned — follow{' '}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-blue hover:underline">
              the repository
            </a>{' '}
            for day-to-day progress.
          </p>
        </div>

        {/* The rail is a sibling of the list, not a child: <ol> may only contain <li>. */}
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#07094c1a] hidden md:block" aria-hidden />
          <ol className="relative m-0 p-0 list-none">
            {sortedMilestones().map((milestone) => (
              <li key={`${milestone.year}-${milestone.quarter}`} className="relative md:pl-10 mb-4 md:mb-6 last:mb-0">
                <span
                  className={`absolute left-0 top-6 hidden md:block w-[15px] h-[15px] rounded-full border-[3px] border-white ${
                    MARKER_CLASS[milestone.status]
                  }`}
                  aria-hidden
                />
                <div className="rounded-[10px] border border-[#07094C1A] bg-white/70 p-5 md:p-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[20px] md:text-[24px] font-extrabold text-dark">{milestone.quarter}</span>
                    <span className="text-sm md:text-[16px] font-semibold text-[#07094c99]">{milestone.year}</span>
                    <span
                      className={`ml-auto text-[12px] md:text-[13px] font-semibold px-2.5 py-0.5 rounded-md ${
                        STATUS_CLASS[milestone.status]
                      }`}
                    >
                      {STATUS_LABEL[milestone.status]}
                    </span>
                  </div>

                  {milestone.summary ? (
                    <p className="mt-2 text-sm md:text-[15px] text-dark/80 leading-relaxed">
                      {withInlineCode(milestone.summary)}
                    </p>
                  ) : null}

                  {milestone.items && milestone.items.length > 0 ? (
                    <ul className="mt-3 list-disc pl-5 space-y-1.5">
                      {milestone.items.map((item) => (
                        <li key={item} className="text-sm md:text-[15px] text-dark/80 leading-relaxed">
                          {withInlineCode(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm md:text-[15px] text-[#07094c66] italic">To be announced.</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-10 text-center text-xs md:text-sm text-dark/60">
          Have something you would like to see on this list?{' '}
          <a href={ISSUE_URL} target="_blank" rel="noreferrer" className="text-blue hover:underline">
            Open an issue
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
