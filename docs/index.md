---
layout: home

hero:
  name: TVMJS
  text: The TRON Virtual Machine in TypeScript
  tagline: Execute TRON contract bytecode wherever JavaScript runs — locally, in CI, or in the browser. No node required.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: What TRON changes
      link: /tron/overview
    - theme: alt
      text: GitHub
      link: https://github.com/tronweb3/tvmjs-monorepo

features:
  - icon: ⚙️
    title: Real TRON semantics
    details: TRC-10 token opcodes, TRON's signature and permission precompiles, the multi-signature account model and energy metering — not an Ethereum VM wearing a TRON label.
    link: /tron/overview
    linkText: See the differences
  - icon: 🧩
    title: Eleven modular packages
    details: Take the whole VM, or just the interpreter, the trie, the RLP codec or the address helpers. Install what you need and nothing else.
    link: /packages/
    linkText: Browse packages
  - icon: 🌐
    title: Runs anywhere JavaScript does
    details: Node, CI and the browser. Contract test suites, local simulators and analysis tooling that would otherwise need a java-tron node.
    link: /guide/getting-started
    linkText: Install it
  - icon: 🔍
    title: Observable execution
    details: Every instruction emits a step event. Read the stack, follow the opcodes, measure energy, profile a call — without patching the interpreter.
    link: /guide/events-and-tracing
    linkText: Tracing and events
  - icon: 🤝
    title: java-tron parity
    details: 1.1.0 aligned address derivation, energy forwarding, deployment limits and proposal gating with the reference client, and made failed executions roll back completely.
    link: /releases/v1.1.0
    linkText: What's new in 1.1.0
  - icon: 🧭
    title: Familiar from EthereumJS
    details: Forked from EthereumJS, so VM, StateManager, Common and the transaction APIs are the ones you already know — with every TRON difference written down.
    link: /guide/migrating-from-ethereumjs
    linkText: What is different
---

## Try it in thirty seconds

::: code-group

```bash [npm]
npm install @tvmjs/tvm @tvmjs/util
```

```bash [pnpm]
pnpm add @tvmjs/tvm @tvmjs/util
```

```bash [yarn]
yarn add @tvmjs/tvm @tvmjs/util
```

:::

Push a value onto the stack and read back the energy it cost:

```ts
import { createTVM } from '@tvmjs/tvm';
import { hexToBytes } from '@tvmjs/util';

const tvm = await createTVM();
const res = await tvm.runCode({ code: hexToBytes('0x6001') }); // PUSH1 01

console.log(res.executionGasUsed); // 3n
```

`@tvmjs/tvm` is the interpreter and `@tvmjs/util` provides the byte helpers. Add
[`@tvmjs/vm`](/packages/) when you move up to whole transactions and blocks.

Requires Node.js >= 20. Continue in [Getting Started](/guide/getting-started).

## Know the boundaries

TVMJS is an execution library, not a node.

It does not implement consensus, it does not synchronise a chain, and its TRON chain presets carry
chainId and local execution settings only. Results are not authoritative for on-chain outcomes —
treat a difference from `java-tron` as a bug to report, and verify anything you rely on in
production against the real network.

The one difference to internalise first: a contract deployed without an explicit
[root transaction ID](/tron/transaction-ids) gets a **different address** than it would on-chain.

## Where to go next

| If you want to…                                     | Start here                                                 |
| --------------------------------------------------- | ---------------------------------------------------------- |
| Run bytecode or a transaction                       | [Getting Started](/guide/getting-started)                  |
| Understand TRON's execution rules                   | [TRON Semantics](/tron/overview)                           |
| Pick a chain, hardfork or proposal                  | [Chain Configuration](/guide/chain-configuration)          |
| Choose between runCode / runCall / runTx / runBlock | [Executing Code](/guide/execution)                         |
| Port code from EthereumJS                           | [Coming from EthereumJS](/guide/migrating-from-ethereumjs) |
| Upgrade from 1.0.0                                  | [What's new in 1.1.0](/releases/v1.1.0)                    |
