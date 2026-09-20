# Introduction

TVMJS is a TypeScript implementation of the **TRON Virtual Machine** — the execution environment
`java-tron` runs on a node. It is a monorepo of modular packages that together execute TRON contract
bytecode in JavaScript and TypeScript.

It is forked from [EthereumJS](https://github.com/ethereumjs/ethereumjs-monorepo) and extended with
TRON's opcodes, TRC-10 token transfers, precompiled contracts, multi-signature permissions and the
TRON account model.

## What you can build with it

- **Contract test suites** that run TRON bytecode in-process, with no node and no network.
- **Local simulators** for dApps, wallets and tooling that need to predict what a contract will do.
- **Analysis tooling** — step through execution, inspect the stack, measure energy.
- **Browser-side execution**, for playgrounds and debuggers that cannot reach a node.

## What it is not

This matters as much as the list above.

::: warning Not a node, not consensus
TVMJS is an execution library. It is **not** a TRON node, not a consensus implementation, and not a
substitute for validating behaviour against a real network. Its results are not a guarantee of how a
contract behaves on-chain — verify anything you rely on in production.
:::

The TRON chain presets it ships (`TronMainnet`, `TronNile`, `TronShasta`) carry chainId and local
execution settings only. They inherit unverified genesis, consensus and hardfork data from the
Mainnet execution baseline and contain no peer-discovery data. Use them for `Common.chainId()`, the
`CHAINID` opcode, and controlled local execution — not for genesis validation, consensus, chain
synchronisation or P2P discovery.

## How the pieces fit

```
@tvmjs/vm            top-level execution context — transactions and blocks
 ├── @tvmjs/tvm      bytecode interpreter — opcodes, energy, precompiles
 │    └── @tvmjs/statemanager   account and storage state
 │         └── @tvmjs/mpt       Merkle Patricia Trie
 ├── @tvmjs/tx       transaction types, including TRC-10 fields
 ├── @tvmjs/block    block and header types
 ├── @tvmjs/blockchain   chain management
 └── @tvmjs/common   shared chain and hardfork configuration
```

Most applications reach for `@tvmjs/vm` (to run transactions and blocks) or `@tvmjs/tvm` (to run raw
bytecode). See [Packages](/packages/) for the full list.

## Where to go next

- **[Getting Started](/guide/getting-started)** — install and run your first bytecode.
- **[TRON Semantics](/tron/overview)** — what TRON changes versus the EVM. Read this before trusting
  any result.
- **[Coming from EthereumJS](/guide/migrating-from-ethereumjs)** — if you already know the upstream
  API.

## License

TVMJS is distributed under the [MPL-2.0](https://mozilla.org/MPL/2.0/) license, as a derivative work
of EthereumJS. Files originating from EthereumJS retain their original license.
