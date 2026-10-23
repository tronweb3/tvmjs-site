# Chain Configuration

`@tvmjs/common` decides which rules the VM executes under: which TRON network preset, which active
network proposals, and which explicit EIPs and TIPs are enabled (with the hardfork fixed to `'tron'`).

## The default is TRON

Since 1.1.0, `createVM()` and `createTVM()` with no explicit `Common` use the execution-only
`TronMainnet` configuration — chainId `728126428`, hardfork `tron`.

```ts
import { createVM } from '@tvmjs/vm';

// TronMainnet rules, chainId 728126428
const vm = await createVM();
```

TVMJS targets TRON execution exclusively. Starting with 1.2.0, inherited Ethereum execution configurations
and legacy normalisation paths are no longer supported. For Ethereum execution, use upstream `@ethereumjs/vm`.
See [Migrating from EthereumJS](/guide/migrating-from-ethereumjs) for behavioural differences.

::: danger Breaking change in 1.2.0
TVMJS 1.2.0 establishes independent TRON execution profiles. Any Ethereum configuration (such as
`new Common({ chain: Mainnet })`) as well as legacy combinations like
`new Common({ chain: Mainnet, hardfork: 'tron' })` are strictly rejected with an exception during
initialization.

Code targeting TRON must use the TRON chain presets (`TronMainnet`, `TronNile`, `TronShasta`) or
`createTronChainIdCommon()`. See [v1.2.0](/releases/v1.2.0).
:::

## TRON chain presets

| Preset        | chainId      |
| ------------- | ------------ |
| `TronMainnet` | `728126428`  |
| `TronNile`    | `3448148188` |
| `TronShasta`  | `2494104990` |

```ts
import { Common, TronNile } from '@tvmjs/common';

const common = new Common({ chain: TronNile });
```

A factory is available when the network is chosen at runtime:

```ts
import { createTronChainIdCommon } from '@tvmjs/common';

const common = createTronChainIdCommon('nile');
```

::: danger Execution-only presets
These presets provide chainId and local execution settings **only**, without inherited Ethereum consensus
or block reward defaults, and contain no peer-discovery data.

Use them for `Common.chainId()`, the `CHAINID` opcode and controlled local execution. Do **not** use
them for TRON genesis validation, consensus or block validation, chain synchronisation, or P2P
discovery.
:::

## Detecting TRON behaviour

`Common.isTron()` reports whether execution is running under TRON execution rules (address derivation,
energy forwarding, lifted size limits, and TRON precompiles):

```ts
if (common.isTron()) {
  // TRON address derivation, energy forwarding, no EIP-170/3860 size limits …
}
```

## Network proposals

TRON gates some behaviour behind on-chain proposals rather than hardforks. Declare which are active
with `activatedProposals`:

```ts
import { Common, TronMainnet } from '@tvmjs/common';

// TRON presets enable Proposal 65 by default (memory opcode energy alignment).
// Include 65 when supplying custom activatedProposals to preserve default memory pricing.
const common = new Common({
  chain: TronMainnet,
  activatedProposals: [65, 95, 96],
});

common.isActivatedProposal(96); // true
common.activatedProposals(); // [65, 95, 96]
```

| Proposal | Name               | Effect in TVMJS                                                                                                                               |
| -------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 65       | —                  | Enabled by default in TRON presets; aligns `MLOAD`, `MSTORE`, and `MSTORE8` Energy costs                                                      |
| 95       | `ALLOW_TVM_PRAGUE` | Recognized proposal flag; execution gating is not yet connected in the current release                                                        |
| 96       | `ALLOW_TVM_OSAKA`  | Gates TIP-854 strict calldata validation and full energy consumption on the `0x09` and `0x0a` precompiles (CLZ still requires `eips: [7939]`) |

IDs are validated, de-duplicated and stored ascending. TRON chain presets include Proposal 65 by default.
When overriding `activatedProposals`, remember to include `65` to retain preset memory instruction pricing.
`Common` does **not** mutate EIPs or params from proposal state on its own — it exposes the flags, and
execution consumers use them as feature gates (for example, enabling `CLZ` opcode support still requires
explicit `eips: [7939]`).

## TIPs and explicit EIPs

Execution runs under the fixed `'tron'` hardfork. TVMJS carries a TRON-specific dictionary (`tipsDict`)
alongside `eipsDict`. `Common.setEIPs()` and `paramByEIP()` reference it. Individual TIPs and EIPs can
be enabled explicitly:

```ts
const common = new Common({ chain: TronMainnet, eips: [7939] }); // CLZ opcode
```

For the full EIP and TIP tables, see the
[`@tvmjs/common` README](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages/common).

## Custom cryptography

The default hashing and signature primitives are JavaScript implementations. A shared `Common` can
carry faster WASM replacements — see the `@tvmjs/common` README section on custom crypto primitives.
