# State and Blockchain

By default `createTVM()` gives you reasonable in-memory defaults for both state and blockhash
lookups. Supply your own when you need real state or a real chain.

## State

`@tvmjs/statemanager` holds accounts and storage. Pass an instance to run against specific state:

```ts
import { createTVM } from '@tvmjs/tvm';
import { MerkleStateManager } from '@tvmjs/statemanager';

const stateManager = new MerkleStateManager();
const tvm = await createTVM({ stateManager });
```

The state manager is where the [TRON account model](/tron/account-model) lives — TRC-10 asset
balances and multi-signature permissions are stored alongside the TRX balance.

### Checkpoints

State changes run inside checkpoints so a failure can be unwound. TVMJS keeps journal checkpoint,
commit and revert bookkeeping aligned with the underlying state manager, and retries transient
rollback failures without leaking caller state or checkpoint depth. When an inner checkpoint is
still active after a rollback retry, the outer revert is skipped rather than reverting the wrong
layer.

You rarely interact with this directly — it matters because it is what makes
[`runCall()` failures atomic](/guide/execution#failures-are-atomic).

### Proofs

EIP-1186 account proofs are bound to the state manager's state root, and storage proofs to the
authenticated account storage root. Proofs for nonexistent accounts are rejected.

## Blockchain

`@tvmjs/blockchain` provides external chain information — most importantly blockhashes for the
`BLOCKHASH` opcode:

```ts
import { createBlockchain } from '@tvmjs/blockchain';
import { createTVM } from '@tvmjs/tvm';

const blockchain = await createBlockchain();
const tvm = await createTVM({ blockchain });
```

## Putting them together

```ts
import { createBlockchain } from '@tvmjs/blockchain';
import { Common, TronMainnet } from '@tvmjs/common';
import { MerkleStateManager } from '@tvmjs/statemanager';
import { createTVM } from '@tvmjs/tvm';

const tvm = await createTVM({
  common: new Common({ chain: TronMainnet }),
  stateManager: new MerkleStateManager(),
  blockchain: await createBlockchain(),
});
```

::: tip One Common, everywhere
When you supply a custom TVM or `tvmOpts` to `createVM()`, the VM keeps its `Common`, `StateManager`
and exposed blockchain instances consistent with the TVM's. Mixing instances is the most common
source of confusing chainId and hardfork mismatches.
:::

## Tries

`@tvmjs/mpt` (Merkle Patricia Trie) and `@tvmjs/binarytree` back the state manager. Both keep
checkpoint reads and final batch commits coherent with their optional LRU cache, so a speculative
put or delete cannot be masked by a stale cached value.
