# Coming from EthereumJS

TVMJS is a fork of [EthereumJS](https://github.com/ethereumjs/ethereumjs-monorepo). If you know that
codebase, almost everything transfers — the classes, the factory functions, the options objects. This
page lists what does not.

## Package names

Every package is renamed from `@ethereumjs/*` to `@tvmjs/*`:

```diff
- import { createVM, runTx } from '@ethereumjs/vm'
+ import { createVM, runTx } from '@tvmjs/vm'
```

The EVM package is called **`@tvmjs/tvm`**, and its factory is `createTVM()`.

## The default chain is TRON

`createVM()` and `createTVM()` default to the execution-only `TronMainnet` configuration
(chainId `728126428`, hardfork `tron`) rather than Ethereum Mainnet. Some Ethereum execution paths
inherited from EthereumJS remain in this release. TVMJS is developed and tested for TRON execution,
however, and does not guarantee Ethereum compatibility in future releases. For Ethereum execution,
use upstream `@ethereumjs/vm`.

For TRON presets and network configuration, see [Chain Configuration](/guide/chain-configuration).

## Behaviour that differs under TRON rules

Most TRON-specific behaviour (such as address derivation, EIP-150 energy forwarding, and contract
size limits) is gated on the chain profile or hardfork. However, with default TVM parameters and
the default precompile registry, TVM instances enforce a **call-depth limit of 64** across all
built-in chain profiles (unless overridden via `params`), and TRON's precompiles (`0x03`, `0x09`,
`0x0a`) remain active regardless of the selected chain (unless modified via `customPrecompiles`).

| Area                          | Ethereum protocol              | TRON                                               |
| ----------------------------- | ------------------------------ | -------------------------------------------------- |
| Metering unit                 | gas                            | [energy](/tron/energy)                             |
| Call depth limit              | 1024                           | 64 (default in TVMJS)                              |
| `CREATE` address              | RLP(sender, nonce)             | root transaction ID + owner address                |
| `CREATE2` preimage            | `0xff`                         | [`0x41`](/tron/addresses)                          |
| Address on the stack          | 20 bytes                       | 21 bytes                                           |
| Call/create energy forwarding | EIP-150 (63/64)                | requested energy up to all available (CALL/CREATE) |
| Runtime code size             | EIP-170 limit                  | no limit                                           |
| Initcode size                 | EIP-3860 limit + word metering | no limit                                           |
| Token transfer                | —                              | [TRC-10 opcodes](/tron/token-opcodes)              |

## Additions with no upstream equivalent

- **TRC-10 opcodes** `CALLTOKEN`, `TOKENBALANCE`, `CALLTOKENVALUE`, `CALLTOKENID`, `ISCONTRACT`.
- **TRON precompiles** `BatchValidateSign` (`0x09`) and `ValidateMultiSign` (`0x0a`), plus TRON's
  `RIPEMD-160` variant at `0x03`.
- **Account fields** `asset` (TRC-10 balances) and `activePermissions`.
- **`tokenId` / `tokenValue`** on `Message` and on the signed legacy transaction format.
- **`rootTransactionId`** as execution context.
- **`Common.isTron()`**, `activatedProposals`, `isActivatedProposal()`.
- **TRON address helpers** in `@tvmjs/util` — see [Addresses](/tron/addresses).

## Removals

- `KZG_POINT_EVALUATION` (EIP-4844) is disabled — not supported by TRON.
- EIP-7480 (EOF data section access) is removed from the supported list.

## Upstream credit

TVMJS is a derivative work of EthereumJS and is distributed under the same
[MPL-2.0](https://mozilla.org/MPL/2.0/) license. Files originating from EthereumJS retain their
original license headers.
