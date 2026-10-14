# Introduction

TVMJS is a TypeScript implementation of the **TRON Virtual Machine** — the execution environment
`java-tron` runs on a node. It is a monorepo of modular packages that together execute TRON contract
bytecode in JavaScript and TypeScript.

It is forked from [EthereumJS](https://github.com/ethereumjs/ethereumjs-monorepo) and extended with
TRON's opcodes, TRC-10 token transfers, precompiled contracts, multi-signature permissions and the
TRON account model.

## What you can build with it

- **Local development nodes** via `@tvmjs/client` that serve the TRON HTTP API (`/wallet/*`) with immediate and interval mining.
- **Contract test suites** that run TRON bytecode in-process, with no external node and no network.
- **Local simulators** for dApps, wallets and tooling that need to predict what a contract will do.
- **Analysis tooling** — step through execution, inspect the stack, measure energy.
- **Browser-side execution**, for playgrounds and debuggers that run without a remote backend.

## Boundaries and live-network validation

This matters as much as the list above.

::: warning Local execution stack, not live-network consensus
TVMJS provides a local execution stack and an in-memory development node (`@tvmjs/client`). It is
**not** a full consensus implementation and does not participate in peer-to-peer block synchronization
with the live TRON network. Its results are not a guarantee of how a contract behaves on-chain — verify
anything you rely on in production against the real network.
:::

The TRON chain presets it ships (`TronMainnet`, `TronNile`, `TronShasta`) carry chainId and local
execution settings only. Starting in 1.2.0, they operate as independent TRON execution profiles
without Ethereum consensus, block reward, or genesis metadata. Use them for `Common.chainId()`,
the `CHAINID` opcode, and controlled local execution — not for live-network genesis validation,
consensus, or P2P discovery.

## How the pieces fit

```
@tvmjs/client        local TRON development node (HTTP REST API, mining, accounts)
 └── @tvmjs/vm       top-level execution context — transactions and blocks
      ├── @tvmjs/tvm bytecode interpreter — opcodes, energy, precompiles
      │    └── @tvmjs/statemanager   account and storage state
      │         └── @tvmjs/mpt       Merkle Patricia Trie
      ├── @tvmjs/tx  transaction types, including TRC-10 fields
      ├── @tvmjs/block    block and header types
      ├── @tvmjs/blockchain   chain management
      └── @tvmjs/common   shared chain configuration
```

Applications can run local HTTP development nodes via `@tvmjs/client`, execute transactions and
blocks via `@tvmjs/vm`, or run raw bytecode via `@tvmjs/tvm`. See [Packages](/packages/) for the full list.

## Where to go next

- **[Getting Started](/guide/getting-started)** — install and run your first bytecode.
- **[TRON Semantics](/tron/overview)** — what TRON changes versus the EVM. Read this before trusting
  any result.
- **[Coming from EthereumJS](/guide/migrating-from-ethereumjs)** — if you already know the upstream
  API.

## License

TVMJS is distributed under the [MPL-2.0](https://mozilla.org/MPL/2.0/) license, as a derivative work
of EthereumJS. Files originating from EthereumJS retain their original license.
