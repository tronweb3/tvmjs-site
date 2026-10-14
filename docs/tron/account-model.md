# Account Model

A TRON account carries more than an Ethereum account. `@tvmjs/util`'s `Account` class is extended
with two fields, both included in RLP serialisation and deserialisation.

## Extra fields

```ts
interface Account {
  // … nonce, balance, storageRoot, codeHash
  asset: { [tokenId: string]: bigint }; // TRC-10 balances keyed by canonical decimal string
  activePermissions: Permission[];
}
```

### `asset` — TRC-10 balances

Token balances live beside the TRX balance, keyed by the canonical decimal string of the token ID
(`tokenIdToKey()`).

::: tip Token ID precision resolved in 1.2.0
Starting in 1.2.0, TVMJS uses canonical decimal string keys (via `tokenIdToKey()`) for in-memory
`asset` mappings and encodes token IDs to bytes for RLP serialisation. Token operations and balances
use lossless 64-bit `bigint` precision, eliminating the previous `Number.MAX_SAFE_INTEGER`
limitation from 1.1.0. See [Token ID precision](/tron/token-opcodes#token-id-precision-limit).
:::

This changes emptiness: **`account.isEmpty()` returns `false` when the account holds a non-zero
TRC-10 balance**, even if nonce, balance and code are all zero. An account holding only tokens is
not empty and will not be cleaned up as if it were.

### `activePermissions` — multi-signature

TRON splits authority into permission types with weighted keys and a threshold:

| Type      | Purpose                     |
| --------- | --------------------------- |
| `Owner`   | Full control of the account |
| `Active`  | Delegated operations        |
| `Witness` | Block production            |

`Key` and `Permission` interfaces describe the shape. Validation is threshold-based — the summed
weight of the supplied signatures must reach the permission's threshold.

The [`ValidateMultiSign` precompile](/tron/precompiles) (`0x0a`) is how contract code checks a
permission.

## State manager interface

`StateManagerInterface` gains `tokenIdExists(tokenId: bigint)`.

::: tip Not required for the token opcodes
`CALLTOKEN` and `TOKENBALANCE` deliberately do **not** call it — they range-check the ID instead.
A valid but unissued token continues or returns zero. See
[TRC-10 Token Opcodes](/tron/token-opcodes#token-ids-are-range-checked-not-existence-checked).
:::

## SELFDESTRUCT

`SELFDESTRUCT` charges new-account energy when the beneficiary does not exist, **regardless of the
transferred value**, and does not charge for an existing empty account.

It also advances the shared TRON internal nonce — unconditionally at depth 0, and on every nested
invocation.
