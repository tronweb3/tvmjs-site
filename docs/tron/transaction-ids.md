# Transaction IDs

TRON contract deployment and internal `CREATE` derive addresses from a 32-byte **root transaction
ID**. That makes the ID part of execution context, not just metadata.

## Supplying the real ID

```ts
const result = await runTx(vm, {
  tx,
  rootTransactionId: javaTronTransactionId,
  tronTransactionIdPolicy: 'require-explicit',
});
```

An explicit ID always takes precedence.

## The policy

`TronTransactionIdPolicy` has two modes:

| Mode                              | Behaviour                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `fallback-to-tx-hash` _(default)_ | With no explicit ID, use the signed transaction's TVMJS hash as a deterministic simulation ID |
| `require-explicit`                | Fail rather than invent an ID                                                                 |

The default exists for compatibility with 1.0.x applications and local simulators, which had no way
to supply a real ID:

```ts
const result = await runTx(vm, {
  tx,
  // Default: tronTransactionIdPolicy: 'fallback-to-tx-hash'
});
```

## The fallback is not a java-tron ID

::: danger Read this before comparing addresses
The fallback hash is the **Keccak hash of the serialized signed TVMJS transaction**. `java-tron` uses
a **SHA-256** transaction ID. They are different values, so a contract deployed under the fallback
gets a **different address than it would on the real chain**.

Use `require-explicit` with the real ID for real-chain replay and consistency testing.
:::

## Block replay

IDs stay transaction-indexed, and the policy is applied by `runTx()` when an entry is missing:

```ts
const result = await runBlock(vm, {
  block,
  rootTransactionIds: javaTronTransactionIds,
  tronTransactionIdPolicy: 'require-explicit',
});
```

Block builders accept the same `rootTransactionId` and `tronTransactionIdPolicy` options on each
`addTransaction()` call.

## Validation happens first

The policy is validated at the `runTx()`, `runBlock()` and block-builder boundaries **before** hooks,
checkpoints, hardfork changes, state cleanup or block access-list replacement. A depth-0 TRON
deployment whose ID is invalid or missing is rejected before any state is mutated, so a bad ID cannot
leak a nonce change.

Root transaction IDs must be `Uint8Array`; other types are rejected rather than coerced.
