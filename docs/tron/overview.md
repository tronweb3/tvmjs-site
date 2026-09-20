# TRON Semantics: Overview

This section documents everything TVMJS does differently from an Ethereum VM. If you are relying on
TVMJS results for anything that touches real value, read it.

The short version: TRON is not "the EVM with a different chainId". It has its own token opcodes,
its own precompiles, a richer account model, a different metering unit, a different address
derivation and a 64-level call depth limit.

## The differences at a glance

| Topic                   | What changes                                                                         | Page                                        |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Token opcodes**       | Five opcodes (`0xd0`–`0xd4`) let contract code carry and inspect TRC-10 tokens       | [TRC-10 Token Opcodes](/tron/token-opcodes) |
| **Precompiles**         | Batch signature and multi-signature validation, plus TRON's 0x03 double-hash variant | [Precompiled Contracts](/tron/precompiles)  |
| **Accounts**            | TRC-10 asset balances and Owner / Active / Witness permissions                       | [Account Model](/tron/account-model)        |
| **Metering**            | Energy instead of gas, 64-level call depth, unreserved energy forwarding             | [Energy Model](/tron/energy)                |
| **Addresses**           | `0x41` prefix, 21-byte stack values, transaction-ID-derived `CREATE`                 | [Addresses](/tron/addresses)                |
| **Deployment identity** | Contract addresses come from the root transaction ID                                 | [Transaction IDs](/tron/transaction-ids)    |

## Where these rules apply

Most TRON behaviour (such as address derivation, EIP-150 energy forwarding, and size limits) is
gated on the **chain profile** (`Common.isTron()`) and hardforks. However, under default TVM
parameters and precompiles, the 64-level call depth limit and TRON precompiles (`0x03`, `0x09`,
`0x0a`) apply across all built-in configurations (unless explicitly overridden via `params` or
`customPrecompiles`).

Some newer behaviour is gated further, on TRON network proposals — see
[network proposals](/guide/chain-configuration#network-proposals).

## Fidelity and its limits

TVMJS aims to match `java-tron`, and 1.1.0 closed most of the gap. But:

::: danger Not a substitute for the real chain
TVMJS is an execution library. Differences from `java-tron` are bugs, not features — but they can
exist. Do not treat a TVMJS result as authoritative for on-chain outcomes. The
[transaction ID fallback](/tron/transaction-ids#the-fallback-is-not-a-java-tron-id) in particular
produces addresses that differ from the real chain unless you supply the real ID.
:::
