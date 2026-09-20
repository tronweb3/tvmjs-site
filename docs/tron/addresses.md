# Addresses

TRON addresses differ from Ethereum addresses in their prefix, their derivation and their width on
the stack. This page is the one to read before comparing a TVMJS address against a real chain.

## Formats

A TRON address is a 20-byte body with a `0x41` prefix — 21 bytes in hex form, or Base58Check for
display. `@tvmjs/util` converts between all three:

```ts
import {
  toTronHexAddress,
  fromTronHexAddress,
  toTronBase58Address,
  fromTronBase58Address,
  isValidTronBase58Address,
} from '@tvmjs/util';
```

| Helper                     | Direction                                  |
| -------------------------- | ------------------------------------------ |
| `toTronHexAddress`         | → `0x41`-prefixed hex                      |
| `fromTronHexAddress`       | `0x41`-prefixed hex →                      |
| `toTronBase58Address`      | → Base58Check                              |
| `fromTronBase58Address`    | Base58Check →                              |
| `isValidTronBase58Address` | Base58Check validation, including checksum |

Test vectors are cross-validated against TronWeb 6.3.0.

Input types are checked rather than coerced: a non-`Uint8Array` input is rejected instead of being
silently turned into a valid-looking but wrong address, and Base58 input is validated for type and
length before decoding.

## 21 bytes on the stack, 20 internally

`CREATE` and `CREATE2` return the `java-tron`-compatible **21-byte** TRON representation on the
stack, while internal account addresses remain 20 bytes. If you read a created address off the stack
and compare it to an account key, account for the prefix.

## CREATE2

::: danger Changed in 1.1.0
`generateAddress2()` implements Ethereum EIP-1014 with the `0xff` preimage. In **1.0.0 it used
TRON's `0x41` preimage**. Code upgrading from 1.0.0 that called it for TRON addresses must switch:

```ts
import { generateTronAddress2 } from '@tvmjs/util';

const address = generateTronAddress2(deployer, salt, initCode);
```

:::

Inside the VM, the derivation is selected by hardfork rather than applied globally — Ethereum
hardfork paths use EIP-1014, TRON profiles use the `0x41` preimage.

## CREATE

TRON does not derive `CREATE` addresses from `RLP(sender, nonce)`.

- **Depth 0 (deployment):** derived from the **transaction ID** and the 21-byte owner address.
- **Internal CREATE:** derived from the root transaction ID and the transaction-wide internal nonce,
  via `generateTronCreateAddress(rootTransactionId, nonce)`.

Ethereum `CREATE` behaviour via `generateAddress()` is preserved on Ethereum hardfork paths.

See [Transaction IDs](/tron/transaction-ids) for where the ID comes from — it determines the
address, so getting it wrong produces a different contract address than the real chain.

## The internal nonce

TRON maintains a shared, transaction-wide **internal nonce** that is propagated across nested
`CALL`, `CREATE` and `CREATE2`. It advances:

- on `CREATE` / `CREATE2` collisions,
- on every nested `SELFDESTRUCT`, and unconditionally at depth 0,

and does **not** advance when `CALLTOKEN` is rejected for insufficient token balance.
