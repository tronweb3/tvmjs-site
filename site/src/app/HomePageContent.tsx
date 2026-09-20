import { GITHUB_URL, NPM_ORG_URL, MPL_LICENSE_URL, assetPath } from '@/lib/config';

/* eslint-disable @next/next/no-img-element */

const FEATURES = [
  {
    title: 'TRC-10 token operations',
    body: ' CALLTOKEN, TOKENBALANCE, CALLTOKENVALUE and CALLTOKENID (0xd0–0xd3) support token transfers, balance queries and access to the current call’s token ID and amount. ISCONTRACT (0xd4) checks whether an address is a contract.',
  },
  {
    title: 'Signature and permission precompiles',
    body: 'BatchValidateSign (0x09) verifies a batch of signatures in a single call, while ValidateMultiSign (0x0a) validates signatures against an account’s configured permission and threshold.',
  },
  {
    title: 'TRON account model',
    body: 'Accounts store TRC-10 balances alongside TRX, with configurable permission data for multi-signature validation. CREATE2 uses TRON’s 0x41 prefix in address derivation.',
  },
  {
    title: 'Energy metering',
    body: 'Execution is metered in Energy, with costs for instructions, memory expansion and state access. The VM uses a 1,024-item operand stack and a call-depth limit of 64. Contract deployment includes a code-deposit cost of 200 Energy per byte of deployed runtime code.',
  },
];

const PACKAGES = [
  { name: '@tvmjs/tvm', desc: 'Bytecode interpreter — TRON opcodes, Energy, precompiles' },
  { name: '@tvmjs/vm', desc: 'Execution context for transactions and blocks' },
  { name: '@tvmjs/tx', desc: 'Local transaction types with TRC-10 fields' },
  { name: '@tvmjs/common', desc: 'TRON network and execution configuration' },
  { name: '@tvmjs/statemanager', desc: 'Account and storage state management' },
  { name: '@tvmjs/blockchain', desc: 'Blockchain data structure and block management' },
  { name: '@tvmjs/block', desc: 'Block and block header types' },
  { name: '@tvmjs/mpt', desc: 'Merkle Patricia Trie' },
  { name: '@tvmjs/binarytree', desc: 'Binary tree data structure' },
  { name: '@tvmjs/rlp', desc: 'RLP encoding and decoding' },
  { name: '@tvmjs/util', desc: 'Shared utilities, account types and address helpers' },
];

export function HomePageContent() {
  return (
    <div className="max-w-1200 mx-auto px-4 pt-[36px] pb-[120px] md:pt-[56px] font-wix text-dark">
      <h1 className="text-[32px] md:text-[56px] font-extrabold text-center leading-tight text-blue">TVMJS</h1>
      <p className="mt-3 text-center text-base md:text-[18px] font-medium">
        The TRON Virtual Machine, implemented in TypeScript.
      </p>

      <p className="mt-6 mx-auto max-w-[820px] text-center text-sm md:text-[16px] leading-[26px] text-dark/80">
        TVMJS is a monorepo of modular packages that implement the TRON Virtual Machine — the smart contract execution
        environment used by{' '}
        <code className="text-blue text-sm md:text-[16px] bg-[#E8E7ED] rounded-sm px-[5px]">java-tron</code> — in
        JavaScript and TypeScript. It executes TRON contract bytecode with support for TRON opcodes, Energy metering,
        precompiles and account state, so you can run and test contracts locally, in CI or in the browser, without
        running a TRON node.
      </p>

      <div className="mt-7 mx-auto w-fit max-w-full overflow-x-auto rounded-lg px-4 py-3 bg-[rgba(231,238,250,1)]">
        <pre className="m-0 text-sm md:text-[15px]">
          <code>npm install @tvmjs/vm @tvmjs/tvm</code>
        </pre>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <ExternalLink
          href={GITHUB_URL}
          className="rounded-md bg-[#4643DF1A] hover:bg-[#4643DF4D] transition-all ease-linear px-4 leading-9 font-bold text-blue flex items-center"
        >
          View on GitHub
          <img src={assetPath('/external-link.svg')} alt="" width={12} height={12} className="ml-1" />
        </ExternalLink>
        <ExternalLink
          href={NPM_ORG_URL}
          className="rounded-md bg-[#4643DF1A] hover:bg-[#4643DF4D] transition-all ease-linear px-4 leading-9 font-bold text-blue flex items-center"
        >
          npm
          <img src={assetPath('/external-link.svg')} alt="" width={12} height={12} className="ml-1" />
        </ExternalLink>
      </div>

      <h2 className="mt-14 text-center text-[22px] md:text-[32px] font-extrabold">Built for TRON</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-[10px] border border-[#07094C33] p-5 bg-white/40">
            <h3 className="text-[16px] md:text-[18px] font-bold">{feature.title}</h3>
            <p className="mt-2 text-sm md:text-[15px] leading-[24px] text-dark/80">{feature.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-center text-[22px] md:text-[32px] font-extrabold">Packages</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className="flex flex-col sm:flex-row sm:items-baseline gap-x-3 border-b border-[#07094C1A] pb-3"
          >
            <ExternalLink href={`https://www.npmjs.com/package/${pkg.name}`} className="text-blue font-semibold">
              <code className="text-sm md:text-[15px]">{pkg.name}</code>
            </ExternalLink>
            <span className="text-sm md:text-[15px] text-dark/70">{pkg.desc}</span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs md:text-sm text-dark/60">
        TVMJS is open source under the <ExternalLink href={MPL_LICENSE_URL}>MPL-2.0</ExternalLink> license.
      </p>
    </div>
  );
}

function ExternalLink({
  href,
  className = 'text-blue hover:underline',
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
