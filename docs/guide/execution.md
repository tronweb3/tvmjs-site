# Executing Code

TVMJS offers four entry points, at four levels of abstraction. Pick the lowest one that answers your
question.

| Entry point       | Package      | Runs                             | Use it when                                    |
| ----------------- | ------------ | -------------------------------- | ---------------------------------------------- |
| `tvm.runCode()`   | `@tvmjs/tvm` | Raw bytecode, no account context | Studying an opcode sequence or a code fragment |
| `tvm.runCall()`   | `@tvmjs/tvm` | A message call against state     | Simulating a call or a deployment              |
| `runTx(vm, …)`    | `@tvmjs/vm`  | One signed transaction           | Replaying or predicting a transaction          |
| `runBlock(vm, …)` | `@tvmjs/vm`  | Every transaction in a block     | Block replay and consistency testing           |

## runCode — bytecode only

```ts
import { createTVM } from '@tvmjs/tvm';
import { hexToBytes } from '@tvmjs/util';

const tvm = await createTVM();
const res = await tvm.runCode({
  code: hexToBytes('0x6003600501'), // PUSH1 03 PUSH1 05 ADD
  gasLimit: BigInt(0xffff),
});

res.executionGasUsed; // energy consumed
res.returnValue; // Uint8Array
```

No sender, no value transfer, no account lookup — just the interpreter.

## runCall — a message call

`runCall()` executes against the state manager: it moves value, touches accounts, and can deploy.

::: warning Deployments need a transaction ID
A depth-0 TRON deployment derives its address from the root transaction ID, so `rootTransactionId`
is required and is validated **before** any state is mutated. See
[Transaction IDs](/tron/transaction-ids).
:::

### Failures are atomic

A failure in `runCall()` — including one thrown from a hook — reverts the caller nonce and balance,
created accounts, the journal, transient storage and block-level access-list checkpoints. Ordinary
TVM execution errors keep the existing top-level nonce semantics.

### Calls are serialised

All public `runCall()` and `runCode()` executions on a TVM instance are serialised, so overlapping
calls cannot overwrite the shared transaction, block, state-manager and journal context.
Interpreter-driven recursive calls continue through the private entry point and are unaffected.

This means you do **not** need to create one TVM per concurrent caller for correctness — but
concurrent calls will queue, so create separate instances if you want parallelism.

## runTx — one transaction

```ts
import { createVM, runTx } from '@tvmjs/vm';

const vm = await createVM();
const res = await runTx(vm, { tx, skipBalance: true });

res.totalGasSpent;
```

`skipBalance` on a caller-supplied prebuilt `message` is scoped to `depth === 0`, so it cannot relax
balance checks for nested execution. Messages that `runCall` builds itself keep the previous
any-depth behaviour.

## runBlock — a whole block

```ts
import { runBlock } from '@tvmjs/vm';

const res = await runBlock(vm, {
  block,
  rootTransactionIds: javaTronTransactionIds, // transaction-indexed
  tronTransactionIdPolicy: 'require-explicit',
});
```

If request accumulation, state-root generation, generated-field construction or pre-commit validation
fails after the transactions have executed, the **whole block checkpoint** is reverted.

## Building blocks

Block builders accept a `rootTransactionId` and `tronTransactionIdPolicy` per `addTransaction()`
call. See the
[`@tvmjs/vm` README](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages/vm) for the
builder API.
