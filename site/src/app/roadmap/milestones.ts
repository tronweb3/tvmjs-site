export type MilestoneStatus = 'released' | 'in-progress' | 'planned';

export type Milestone = {
  /** Quarter label shown on the card, e.g. "Q1". */
  quarter: string;
  year: string;
  status: MilestoneStatus;
  /** Short line under the quarter. Leave empty until the theme is decided. */
  summary?: string;
  /** Bullet points. An empty list renders the "to be announced" placeholder. */
  items?: string[];
};

/**
 * Listed newest first, matching how the page renders them. `sortedMilestones()` enforces
 * that order regardless of how entries are written here, so adding a quarter anywhere in
 * the array is safe.
 *
 * Copy may wrap identifiers in `backticks`; RoadmapPageContent renders those spans as
 * inline code, so the data here stays plain strings.
 *
 * Fill `summary` / `items` in as each quarter is planned, and move `status` from
 * `planned` to `in-progress` to `released`. A quarter with no `items` renders the
 * "to be announced" placeholder.
 *
 * Q2 mirrors the 1.0.0 announcement (see app/announcement/announcements.tsx) and Q3
 * summarises the 1.1.0 release (the CHANGELOG of each tvmjs-monorepo package) — keep
 * them in step when a release lands.
 */
export const MILESTONES: Milestone[] = [
  {
    quarter: 'Q4',
    year: '2026',
    status: 'planned',
    summary: 'TVMJS 1.2.0 — TRON execution profiles, Energy alignment, and RPC client PoC.',
    items: [
      'Extend java-tron Energy alignment by removing Ethereum’s EIP-2929 warm/cold access pricing and aligning account access, storage operations, CALL/CALLTOKEN, SELFDESTRUCT and refund behavior across VM and TVM execution.',
      'Introduce an independent TRON execution profile and capability matrix across Common, VM and TVM. Retain Mainnet, Nile and Shasta network selection while removing Ethereum hardfork scheduling and inherited Ethereum genesis and consensus metadata.',
      'Remove unsupported Ethereum features, including Blob transactions, Beacon Root processing, BLOBBASEFEE and EIP-7702 authorization. Clean up their associated APIs, dependencies, examples and obsolete test runners, including the execution-spec-tests fixture submodule.',
      'Preserve TRC-10 token ID precision across transactions, account balances, serialization and state management. Prevent collisions above JavaScript’s safe-integer range and strengthen asset isolation through nested calls, checkpoints and rollback.',
      'Deliver an experimental java-tron RPC client with a runnable demo connecting remote account, code and storage reads to local contract execution. Include block and transaction field mappings, reproducible offline fixtures and node comparisons, providing a foundation for future TronBox integration.',
      'Complete Node.js, VM API and browser regression testing, audit and prune dependencies, and publish migration guidance and updated package documentation for the v1.2.0 release.',
    ],
  },
  {
    quarter: 'Q3',
    year: '2026',
    status: 'released',
    summary: 'TVMJS 1.1.0 — java-tron execution alignment, TRON chain presets, and stronger execution safeguards.',
    items: [
      'Aligned contract address derivation with java-tron: top-level deployments use the transaction ID and owner address, while internal CREATE uses the root transaction ID and a transaction-level internal nonce. CREATE/CREATE2 return 21-byte TRON address values on the stack, with Ethereum’s EIP-1014 0xff derivation kept separate from TRON’s 0x41 preimage.',
      'Added execution-only TronMainnet, TronNile and TronShasta presets, together with createTronChainIdCommon() and Common.isTron(). createVM() and createTVM() now default to TronMainnet, with chainId 728126428; explicitly configured Ethereum Mainnet remains available in this release.',
      'Added proposal configuration and queries through activatedProposals and Common.isActivatedProposal() for Proposal 95 (ALLOW_TVM_PRAGUE) and Proposal 96 (ALLOW_TVM_OSAKA). Proposal 96 gates TIP-854 calldata validation for the 0x09 and 0x0a precompiles.',
      'Aligned version-0 CALL/CREATE Energy forwarding and SELFDESTRUCT new-account charging with java-tron. Stopped applying Ethereum’s EIP-170 runtime-code limits and EIP-3860 initcode limits and word charges to TRON execution, while retaining code-deposit costs.',
      'Strengthened rollback for unexpected execution, event-hook and block-finalization failures in runCall() and runBlock(). Serialized public runCall() and runCode() executions on each TVM instance to protect shared execution context.',
      'Added conversions between internal 20-byte addresses, TRON Hex and Base58Check, with vectors cross-checked against TronWeb. Introduced TronTransactionIdPolicy with fallback-to-tx-hash for deterministic local simulation and require-explicit for callers supplying real TRON transaction IDs.',
      'Hardened signature-precompile input parsing, bound EIP-1186 account and storage proof verification to the appropriate state roots, and kept MPT checkpoint reads consistent with cached writes and deletions.',
    ],
  },
  {
    quarter: 'Q2',
    year: '2026',
    status: 'released',
    summary: 'TVMJS 1.0.0 — the first public release of the TRON Virtual Machine in TypeScript.',
    items: [
      'Published eleven modular packages to npm, led by @tvmjs/vm and @tvmjs/tvm, for running and testing TRON contract bytecode locally, in CI and in browser applications.',
      'Implemented CALLTOKEN, TOKENBALANCE, CALLTOKENVALUE and CALLTOKENID (0xd0–0xd3) for TRC-10 transfers and queries, plus ISCONTRACT (0xd4) for contract detection.',
      'Added TRON’s BatchValidateSign (0x09) and ValidateMultiSign (0x0a) precompiles for batch signature verification and permission-based multi-signature validation, together with TRON’s hashing behavior at 0x03.',
      'Extended accounts with TRC-10 balances alongside TRX and configurable permission data for multi-signature validation. Introduced CREATE2 address derivation using TRON’s 0x41 prefix.',
      'Added TRON opcode costs within the existing gas metering API. The VM provides a 1,024-item operand stack and a call-depth limit of 64; deployment includes a code-deposit cost of 200 Energy per byte of deployed runtime code.',
    ],
  },
];

export const STATUS_LABEL: Record<MilestoneStatus, string> = {
  released: 'Released',
  'in-progress': 'In progress',
  planned: 'Planned',
};

/** "Q3" -> 3, for ordering. */
function quarterNumber(quarter: string) {
  return Number(quarter.replace(/\D/g, '')) || 0;
}

/** Milestones in reverse chronological order — most recent quarter first. */
export function sortedMilestones(): Milestone[] {
  return [...MILESTONES].sort((a, b) =>
    a.year === b.year ? quarterNumber(b.quarter) - quarterNumber(a.quarter) : Number(b.year) - Number(a.year)
  );
}
