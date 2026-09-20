import { ReactNode } from 'react';
import { RELEASES_URL, NPM_ORG_URL } from '@/lib/config';

export type AnnouncementItem = {
  time: string;
  title: string;
  version: string;
  content: ReactNode;
  imgList?: string[];
  detailContent?: string;
};

export function NpmPackage({ name }: { name: string }) {
  return (
    <a
      className="text-blue hover:underline"
      href={`https://www.npmjs.com/package/${name}`}
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </a>
  );
}

export const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    time: 'September 10, 2026',
    title: 'TVMJS 1.1.0 — java-tron execution parity',
    version: '1.1.0',
    content: (
      <p>
        <NpmPackage name="@tvmjs/tvm" />, <NpmPackage name="@tvmjs/vm" />, <NpmPackage name="@tvmjs/common" /> and{' '}
        <NpmPackage name="@tvmjs/util" /> move to 1.1.0. Contract address derivation, energy forwarding and the account
        model now follow java-tron, TRON chain presets ship with real chainIds, and failed executions roll back
        completely.
      </p>
    ),
    detailContent: `
## What's in 1.1.0

1.1.0 is about matching java-tron rather than approximating it. Address derivation, energy
forwarding, deployment limits and proposal gating now follow the reference client, and the
execution path was reworked so a failure cannot leave partial state behind.

## Breaking changes

- **The default chain is now TRON.** Without an explicit \`Common\`, \`createVM()\` and \`createTVM()\`
  use the execution-only \`TronMainnet\` preset (chainId 728126428, hardfork \`tron\`) instead of
  Ethereum Mainnet. Pass \`new Common({ chain: Mainnet })\` for Ethereum rules. The legacy
  \`new Common({ chain: Mainnet, hardfork: 'tron' })\` form still works and is normalised to
  \`TronMainnet\`, but new code should use \`TronMainnet\` directly.
- **\`generateAddress2()\` is Ethereum again.** It returns to EIP-1014's \`0xff\` preimage; TRON CREATE2
  moves to the new \`generateTronAddress2()\`. Code written against 1.0.0 that called
  \`generateAddress2()\` for TRON addresses must migrate.
- **TRON deployments need a transaction ID.** Top-level deployments and internal CREATE derive their
  address from the root transaction ID, so \`rootTransactionId\` is required. \`runTx()\` falls back to
  the signed transaction hash by default; set \`TronTransactionIdPolicy\` to \`require-explicit\` for
  real-chain replay.
- **Chain-bound transactions must match the VM.** EIP-155 and typed transactions whose chainId differs
  from the VM are rejected — construct them with the VM's \`Common\`, for example
  \`createLegacyTx(data, { common: vm.common })\`. Unprotected legacy transactions are still accepted.

## java-tron parity

- Top-level deployments and internal CREATE derive addresses from the root transaction ID and the
  21-byte owner address; CREATE/CREATE2 return the 21-byte TRON representation on the stack while
  internal account addresses stay 20 bytes.
- The shared TRON internal nonce advances across nested CALL, CREATE and CREATE2, on CREATE/CREATE2
  collisions, and on every nested \`SELFDESTRUCT\`.
- Version-0 CALL and CREATE forward the full available energy, matching java-tron rather than
  Ethereum's EIP-150 rule.
- \`SELFDESTRUCT\` charges new-account energy when the beneficiary does not exist, regardless of the
  transferred value, and does not charge for an existing empty account.
- \`CALLTOKEN\` and \`TOKENBALANCE\` validate only the TRC-10 token ID range, so valid but unissued IDs
  continue or return zero rather than failing.
- Ethereum's EIP-170 runtime-size and EIP-3860 initcode limits no longer apply on TRON chain profiles.

## TRON chain configuration

- New execution-only presets \`TronMainnet\`, \`TronNile\` and \`TronShasta\` (chainIds 728126428,
  3448148188 and 2494104990) plus a \`createTronChainIdCommon(network, opts?)\` factory. These carry
  execution rules only — they are not complete network configurations.
- \`Common.isTron()\` reports TRON chain-level behaviour even when a preset selects an earlier hardfork.
- \`activatedProposals\`, \`Common.activatedProposals()\` and \`Common.isActivatedProposal(id)\` gate
  Proposal 95 (\`ALLOW_TVM_PRAGUE\`) and 96 (\`ALLOW_TVM_OSAKA\`); Proposal 96 drives the TIP-854
  calldata-shape rules on the \`0x09\` and \`0x0a\` precompiles.

## Execution atomicity

- A failure in \`runCall()\` — including one thrown from a hook — reverts the caller nonce and balance,
  created accounts, the journal, transient storage and block-level access-list checkpoints.
- \`runBlock()\` reverts the whole block checkpoint when request accumulation, state-root generation or
  pre-commit validation fails after transactions have executed.
- Journal checkpoint, commit and revert bookkeeping stays aligned when the underlying StateManager
  rejects, and transient rollback failures are retried without leaking caller state.
- Public \`runCall()\` and \`runCode()\` executions are serialised, so overlapping calls cannot overwrite
  shared transaction, block, state-manager and journal context.
- Event listeners keep their registration order, \`once()\` semantics and custom context, including
  listeners that throw.

## New APIs

- Address conversion in \`@tvmjs/util\`: \`toTronHexAddress\`, \`fromTronHexAddress\`, \`toTronBase58Address\`,
  \`fromTronBase58Address\` and \`isValidTronBase58Address\` (Base58Check), cross-validated against
  TronWeb 6.3.0.
- \`generateTronCreateAddress(rootTransactionId, nonce)\` and \`generateTronAddress2()\` for
  java-tron-compatible derivation.
- \`TronTransactionIdPolicy\` with \`fallback-to-tx-hash\` (default) and \`require-explicit\` modes, forwarded
  through \`runTx()\`, \`runBlock()\` and the block builders.

## Hardening

- TRON signature precompiles check the signature count before extraction and always read fixed 65-byte
  signatures, so a caller-controlled ABI length word cannot drive an oversized allocation.
- EIP-1186 account proofs are bound to the StateManager state root and storage proofs to the
  authenticated account storage root; proofs for nonexistent accounts are rejected.
- MPT and binary-tree checkpoint reads stay coherent with the optional LRU cache, so speculative writes
  cannot be masked by stale cached values.
- Token fields are rejected on EIP-2930, EIP-1559, EIP-4844 and EIP-7702 transactions, which do not
  carry them in their signing payload; TRC-10 transaction-level transfers remain on the signed legacy
  format.
- Dependency updates for known vulnerabilities (vitest, js-yaml, nanoid).

## Versions

\`@tvmjs/common\`, \`@tvmjs/tvm\`, \`@tvmjs/util\` and \`@tvmjs/vm\` are 1.1.0. \`@tvmjs/block\`,
\`@tvmjs/blockchain\`, \`@tvmjs/binarytree\`, \`@tvmjs/mpt\`, \`@tvmjs/statemanager\` and \`@tvmjs/tx\` are 1.0.1.
`,
  },
  {
    time: 'June 3, 2026',
    title: 'TVMJS 1.0.0 — the TRON Virtual Machine in TypeScript',
    version: '1.0.0',
    content: (
      <p>
        The first release of TVMJS. Eleven packages, led by <NpmPackage name="@tvmjs/vm" /> and{' '}
        <NpmPackage name="@tvmjs/tvm" />, are{' '}
        <a className="text-blue hover:underline" href={NPM_ORG_URL} onClick={(e) => e.stopPropagation()}>
          published on npm
        </a>{' '}
        and execute TRON contract bytecode in JavaScript and TypeScript — no node required.
      </p>
    ),
    detailContent: `
## What's in 1.0.0

TVMJS implements the TRON Virtual Machine as a set of modular packages, so a dApp, a test suite or a
tool can run TRON contract bytecode wherever JavaScript runs — locally, in CI, or in the browser.

### TRC-10 token operations
- Five TRON opcodes: \`CALLTOKEN\` (0xd0), \`TOKENBALANCE\` (0xd1), \`CALLTOKENVALUE\` (0xd2),
  \`CALLTOKENID\` (0xd3) and \`ISCONTRACT\` (0xd4).
- Contract calls can attach a TRC-10 token, and contract code can read token balances directly from
  bytecode.

### Signature and permission precompiles
- \`BatchValidateSign\` (0x09) verifies a batch of signatures in a single call.
- \`ValidateMultiSign\` (0x0a) checks a multi-signature permission.
- TRON's own \`RIPEMD-160\` (0x03, double hash) and TVM variants at 0x20003 and 0x20009 (\`BLAKE2F\`).

### TRON account model
- Accounts carry TRC-10 asset balances next to their TRX balance.
- Permissions are split into Owner / Active / Witness with configurable thresholds.
- \`CREATE2\` derives addresses using TRON's \`0x41\` prefix.

### Energy metering
- Execution is metered in energy rather than gas.
- 64-slot stack.
- An energy cost is defined for every opcode, and contract deployment costs \`200 × code length\`.

## Packages

| Package | Description |
|---|---|
| \`@tvmjs/tvm\` | Bytecode interpreter — TRON opcodes, energy, precompiles |
| \`@tvmjs/vm\` | Execution context: runs transactions and blocks |
| \`@tvmjs/tx\` | Transaction types, including TRC-10 transfer fields |
| \`@tvmjs/common\` | Chain and hardfork configuration |
| \`@tvmjs/statemanager\` | Account and storage state |
| \`@tvmjs/blockchain\` | Blockchain data structure and block management |
| \`@tvmjs/block\` | Block and block header types |
| \`@tvmjs/mpt\` | Merkle Patricia Trie |
| \`@tvmjs/binarytree\` | Binary tree data structure |
| \`@tvmjs/rlp\` | RLP encoding and decoding |
| \`@tvmjs/util\` | Shared utilities, account types, address helpers |

## Getting started

\`\`\`shell
npm install @tvmjs/vm @tvmjs/tvm
\`\`\`

## Requirements

- Node.js >= 20
- npm >= 10

## License

Distributed under the [MPL-2.0](https://mozilla.org/MPL/2.0/) license.
`,
  },
];

export function getAnnouncementDetailHref(version: string, isDev: boolean) {
  return isDev ? `/announcement/${version}` : `/announcement/${version}.html`;
}

/**
 * Release notes link to the repository's releases index rather than a per-version tag —
 * the tag URLs are not published for every release.
 */
export function getReleaseNoteHref() {
  return RELEASES_URL;
}
