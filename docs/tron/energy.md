# Energy Model

TRON meters execution in **energy** rather than gas. The accounting shape is the same; the
parameters are not.

::: tip Local simulation
TVMJS energy accounting may differ from `java-tron`. Simulation results do not guarantee actual
on-chain energy consumption; verify against the target network before relying on them in production.
:::

## Parameters

| Parameter              | Ethereum protocol      | TRON                                             |
| ---------------------- | ---------------------- | ------------------------------------------------ |
| Metering unit          | gas                    | energy                                           |
| Call depth limit       | 1024                   | **64** (default in TVMJS)                        |
| Operand stack limit    | 1024                   | 1024                                             |
| Call/create forwarding | EIP-150 (63/64 rule)   | requested energy up to all available (version 0) |
| Contract deployment    | EIP-3860 word metering | `200 × code length + base`                       |
| Runtime code size      | EIP-170 limit          | no limit                                         |
| Initcode size          | EIP-3860 limit         | no limit                                         |

Every TRON-specific opcode has its own energy cost.

## The 64-level call depth limit

Under default TVM parameters, the maximum contract call depth (the limit on nested `CALL`,
`CALLCODE`, `DELEGATECALL`, `STATICCALL`, `CALLTOKEN`, `CREATE`, and `CREATE2`) is **64**, compared
to the Ethereum protocol's 1024. Contracts or recursive call patterns that rely on deeper call
stacks will fail on TRON. Note that with default TVM options this limit applies across all built-in
profiles (unless overridden via `params`), while the EVM/TVM **operand stack** remains 1024 items.

## Energy forwarding

Under TRON version-0 rules, the CALL and CREATE families (including `CALL`, `CALLCODE`,
`DELEGATECALL`, `STATICCALL`, `CALLTOKEN`, `CREATE`, and `CREATE2`) forward the requested energy
**up to all available energy** (`min(requested, available)`), without applying Ethereum's EIP-150
rule which reserves 1/64 for the caller. A contract that relies on having 1/64 energy left after a
failing subcall behaves differently on the two chains.

Ethereum EIP-150 forwarding is preserved on Ethereum hardfork paths.

## Size limits are lifted

Ethereum's EIP-170 runtime-size limit and EIP-3860 initcode-size limit and word metering do **not**
apply on TRON chain profiles — independently of the selected hardfork. Code-deposit energy and the
other deployment validation are unchanged.

This is chain-level, so it holds whenever `Common.isTron()` is true.

## Where TIP-854 charges everything

Under Proposal 96 / Osaka, invalid calldata to the `0x09` and `0x0a`
[precompiles](/tron/precompiles) consumes the complete forwarded energy rather than refunding the
remainder.
