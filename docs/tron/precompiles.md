# Precompiled Contracts

TRON adds signature and permission precompiles, and overrides the `0x03` hash precompile.

## TRON precompiles

| Address   | Name                | Status       | Description                                                     |
| --------- | ------------------- | ------------ | --------------------------------------------------------------- |
| `0x09`    | `BatchValidateSign` | Active       | Validate a batch of signatures in one call                      |
| `0x0a`    | `ValidateMultiSign` | Active       | Validate a multi-signature permission                           |
| `0x03`    | `RIPEMD-160`        | Active       | TRON-specific double hash: `sha256(sha256(input)[0:20])`        |
| `0x20003` | `RIPEMD-160`        | Unregistered | TVM-specific variant (source exists, not registered by default) |

::: warning Unregistered precompile addresses
Source files for `0x20003` (RIPEMD-160) and `0x20009` (BLAKE2F) exist in the codebase but are
**not yet registered** in the precompile table by default. Calling them executes as a standard
account call (loading code from `StateManager`, or returning empty output if no code is deployed)
rather than executing the precompile.
:::

## Input bounds

Both signature precompiles read a caller-supplied ABI-encoded array. TVMJS checks the **signature
count before extraction** and always extracts fixed 65-byte signatures, so a crafted length word
cannot drive an oversized allocation.

## TIP-854 calldata rules

Under TRON Proposal 96 / Osaka, `0x09` and `0x0a` apply strict calldata-shape validation: invalid
input fails and **consumes the complete forwarded energy**.

This is gated — it only applies when Proposal 96 is activated:

```ts
import { Common, TronMainnet } from '@tvmjs/common';

const common = new Common({ chain: TronMainnet, activatedProposals: [96] });
```

Without the gate, the pre-TIP-854 behaviour applies. See
[network proposals](/guide/chain-configuration#network-proposals).

## Disabled upstream precompiles

- `KZG_POINT_EVALUATION` (EIP-4844) is disabled — not supported by TRON.

## Custom precompiles

TVMJS keeps the upstream custom-precompile API and extends it: precompile addresses accept
`PrefixedHexString`, and `getPrecompile()` is exported alongside additional precompile types. See the
_Custom Precompiles_ section of the
[`@tvmjs/tvm` README](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages/tvm).
