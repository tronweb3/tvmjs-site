# Chain Configuration

`@tvmjs/common` decides which rules the VM executes under: which chain, which hardfork, which EIPs
and TIPs, and which TRON network proposals are active.

## The default is TRON

Since 1.1.0, `createVM()` and `createTVM()` with no explicit `Common` use the execution-only
`TronMainnet` configuration — chainId `728126428`, hardfork `tron`.

```ts
import { createVM } from '@tvmjs/vm';

// TronMainnet rules, chainId 728126428
const vm = await createVM();
```

TVMJS targets TRON execution. This release retains some Ethereum execution paths inherited from
EthereumJS, but they are not a long-term compatibility target and may change or be removed in a
future release. For Ethereum execution, use upstream `@ethereumjs/vm`. See
[Migrating from EthereumJS](/guide/migrating-from-ethereumjs) for behavioural differences.

::: warning This changed in 1.1.0
In 1.0.0 the default was chainId 1 combined with the TRON hardfork. `new Common({ chain: Mainnet })`
no longer reproduces that — it is now plain Ethereum Mainnet. The legacy explicit form
`new Common({ chain: Mainnet, hardfork: 'tron' })` is still accepted and normalised to `TronMainnet`,
but new code should name `TronMainnet` directly. See [v1.1.0](/releases/v1.1.0).
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
These presets provide chainId and local execution settings **only**. They inherit unverified genesis,
consensus and hardfork data from the Mainnet execution baseline, and contain no peer-discovery data.

Use them for `Common.chainId()`, the `CHAINID` opcode and controlled local execution. Do **not** use
them for TRON genesis validation, consensus or block validation, chain synchronisation, or P2P
discovery.
:::

## Detecting TRON behaviour

Some TRON behaviour is chain-level rather than hardfork-level, and must stay active even when a TRON
preset selects an earlier hardfork. `Common.isTron()` reports that:

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

const common = new Common({
  chain: TronMainnet,
  activatedProposals: [95, 96],
});

common.isActivatedProposal(96); // true
common.activatedProposals(); // [95, 96]
```

| Proposal | Name               | Effect in TVMJS                                                                                             |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| 95       | `ALLOW_TVM_PRAGUE` | Gates Prague-era behaviour on TRON                                                                          |
| 96       | `ALLOW_TVM_OSAKA`  | Gates Osaka-era behaviour, including the TIP-854 strict calldata rules on the `0x09` and `0x0a` precompiles |

IDs are validated, de-duplicated and stored ascending. `Common` does **not** mutate EIPs or params
from proposal state on its own — it exposes the flags, and execution consumers use them as feature
gates.

## Hardforks and TIPs

TVMJS carries a TRON-specific EIP dictionary (`tipsDict`) alongside the upstream `eipsDict`.
`Common.setEIPs()` and `paramByEIP()` reference it. Individual TIPs can be enabled explicitly:

```ts
const common = new Common({ chain: TronMainnet, eips: [7939] }); // CLZ opcode
```

For the full hardfork and EIP tables, see the
[`@tvmjs/common` README](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages/common).

## Custom cryptography

The default hashing and signature primitives are JavaScript implementations. A shared `Common` can
carry faster WASM replacements — see the `@tvmjs/common` README section on custom crypto primitives.
