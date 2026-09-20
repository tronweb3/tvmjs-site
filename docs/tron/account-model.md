# Account Model

A TRON account carries more than an Ethereum account. `@tvmjs/util`'s `Account` class is extended
with two fields, both included in RLP serialisation and deserialisation.

## Extra fields

```ts
interface Account {
  // … nonce, balance, storageRoot, codeHash
  asset: { [tokenId: number]: bigint }; // TRC-10 balances
  activePermissions: Permission[];
}
```

### `asset` — TRC-10 balances

Token balances live beside the TRX balance, keyed by token ID.

::: warning Token ID precision in 1.1.0
Balance amounts are `bigint`, but TVMJS 1.1.0 converts token IDs to JavaScript `number` values
when accessing balances. IDs above `Number.MAX_SAFE_INTEGER` (`9007199254740991`) can lose
precision and resolve to the same balance key as a different ID. Using `bigint` for an input ID
does not avoid this internal conversion.

Reject IDs above this limit before passing them to TVMJS, using a lossless representation for
validation. Do not rely on balance or transfer results if contract execution produces such IDs
internally. See [Token ID precision limit in 1.1.0](/tron/token-opcodes#token-id-precision-limit)
for the current limitation and input validation guidance.
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

`StateManagerInterface` gains `tokenIdExists(tokenId: number)`.

::: tip Not required for the token opcodes
`CALLTOKEN` and `TOKENBALANCE` deliberately do **not** call it — they range-check the ID instead.
Within the precision limit described above, a valid but unissued token continues or returns zero. See
[TRC-10 Token Opcodes](/tron/token-opcodes#token-ids-are-range-checked-not-existence-checked).
:::

## SELFDESTRUCT

`SELFDESTRUCT` charges new-account energy when the beneficiary does not exist, **regardless of the
transferred value**, and does not charge for an existing empty account. Ethereum's EIP-161 behaviour
is preserved on pre-TRON hardforks.

It also advances the shared TRON internal nonce — unconditionally at depth 0, and on every nested
invocation.
