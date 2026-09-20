# Packages

TVMJS is a monorepo of eleven packages published under the
[`@tvmjs`](https://www.npmjs.com/org/tvmjs) npm organisation. Install only what you need — the
dependency arrows below show what pulls in what.

## Execution

| Package                                                  | Description                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`@tvmjs/vm`](https://www.npmjs.com/package/@tvmjs/vm)   | Top-level execution context: runs transactions and blocks, manages state transitions |
| [`@tvmjs/tvm`](https://www.npmjs.com/package/@tvmjs/tvm) | Bytecode interpreter — TRON opcodes, energy, precompiles                             |

## Data types

| Package                                                        | Description                                                             |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`@tvmjs/tx`](https://www.npmjs.com/package/@tvmjs/tx)         | Transaction types, including the TRC-10 `tokenId` / `tokenValue` fields |
| [`@tvmjs/block`](https://www.npmjs.com/package/@tvmjs/block)   | Block and block header types                                            |
| [`@tvmjs/common`](https://www.npmjs.com/package/@tvmjs/common) | Chain and hardfork configuration shared across packages                 |

## State and storage

| Package                                                                    | Description                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| [`@tvmjs/statemanager`](https://www.npmjs.com/package/@tvmjs/statemanager) | Account and storage state                      |
| [`@tvmjs/blockchain`](https://www.npmjs.com/package/@tvmjs/blockchain)     | Blockchain data structure and block management |
| [`@tvmjs/mpt`](https://www.npmjs.com/package/@tvmjs/mpt)                   | Merkle Patricia Trie                           |
| [`@tvmjs/binarytree`](https://www.npmjs.com/package/@tvmjs/binarytree)     | Binary tree data structure                     |

## Primitives

| Package                                                    | Description                                      |
| ---------------------------------------------------------- | ------------------------------------------------ |
| [`@tvmjs/util`](https://www.npmjs.com/package/@tvmjs/util) | Shared utilities, account types, address helpers |
| [`@tvmjs/rlp`](https://www.npmjs.com/package/@tvmjs/rlp)   | RLP encoding and decoding                        |

## Dependency shape

```
@tvmjs/vm            top-level execution context
 ├── @tvmjs/tvm      bytecode interpreter (opcodes, energy, precompiles)
 │    └── @tvmjs/statemanager   account/storage state
 │         └── @tvmjs/mpt       Merkle Patricia Trie
 ├── @tvmjs/tx       transaction types (with tokenId/tokenValue)
 ├── @tvmjs/block    block / block header
 ├── @tvmjs/blockchain   chain management
 └── @tvmjs/common   shared chain config
```

## Versioning

The packages are released together but do not share one version number. As of the 1.1.0 release:

| Version | Packages                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| `1.1.0` | `@tvmjs/common`, `@tvmjs/tvm`, `@tvmjs/util`, `@tvmjs/vm`                                                  |
| `1.0.1` | `@tvmjs/binarytree`, `@tvmjs/block`, `@tvmjs/blockchain`, `@tvmjs/mpt`, `@tvmjs/statemanager`, `@tvmjs/tx` |
| `1.0.0` | `@tvmjs/rlp`                                                                                               |

## Reference documentation

Each package ships a README with its full API surface, supported hardforks and EIP tables. They are
the authoritative reference:

[github.com/tronweb3/tvmjs-monorepo/tree/master/packages](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages)

## Builds

All packages ship hybrid CJS/ESM builds and run in the browser. See the _Browser_ and _Hybrid
CJS/ESM Builds_ sections of each README.
