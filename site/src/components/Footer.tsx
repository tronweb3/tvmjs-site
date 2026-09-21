import { GITHUB_URL, assetPath, PARENT_ROOT, BRAND } from '@/lib/config';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="md:h-20 border-t-[1px] border-solid" style={{ borderColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="flex justify-between items-center py-5 md:py-0 px-4 mx-auto my-0 w-basic h-full max-w-1200 flex-wrap">
        {/* Same target as the nav logo: out to the parent site at the origin root. A plain <a>,
            because next/link would prefix basePath and stay inside this site. */}
        <a href={PARENT_ROOT} className="flex text-dark text-xs md:text-xl font-wix font-bold no-underline">
          <Image
            src={assetPath('/logo.png')}
            alt=""
            width={24}
            height={24}
            className="w-4 h-4 md:w-6 md:h-6 mr-[5px] md:mr-2"
          />
          {BRAND}
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center cursor-pointer">
          <Image src={assetPath('/github.svg')} alt="GitHub" className="rounded-full mr-2" width={24} height={24} />
          <span className="font-wix font-semibold text-sm md:text-[16px] text-dark opacity-60 hover:opacity-100 ">
            GitHub
          </span>
          <Image src={assetPath('/external.png')} alt="Visit" className=" ml-1" width={12} height={12} />
        </a>
      </div>
    </footer>
  );
}
