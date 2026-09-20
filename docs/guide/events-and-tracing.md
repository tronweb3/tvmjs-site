# Events and Tracing

The TVM and VM both expose an event emitter. Events are the supported way to observe execution —
stepping, profiling and instrumentation all build on them.

## Stepping through execution

```ts
import { createTVM } from '@tvmjs/tvm';

const tvm = await createTVM();

tvm.events.on('step', (data) => {
  console.log(`${data.pc}\t${data.opcode.name}\tstack: ${data.stack}`);
});
```

::: warning `data.stack` is live
The stack handed to a `step` listener is a reference to the interpreter's internal stack, not a
copy. Read it; do not hold on to it or mutate it.
:::

## Listener semantics

TVMJS preserves standard `EventEmitter` behaviour even though hook callbacks are awaited:

- registration **order** is preserved,
- `once()` listeners fire exactly once,
- custom listener context (`this`) is preserved,
- a listener that **throws** does not corrupt the emitter.

A hook that throws is treated as an execution failure: `runCall()` reverts the caller nonce and
balance, created accounts, the journal, transient storage and block-level access-list checkpoints.
This is deliberate — an instrumentation bug should not leave half-applied state behind.

## VM-level events

`@tvmjs/vm` emits block and transaction events with the same guarantees. See the
[`@tvmjs/vm` README](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages/vm) for the
event list and for the difference between asynchronous and synchronous handlers.

## Profiling

The TVM ships a profiler that reports per-opcode timings. Profiler timers stay balanced for
top-level prebuilt messages, and a partial profiling session is cancelled if execution throws. See
the _Profiling the TVM_ section of the
[`@tvmjs/tvm` README](https://github.com/tronweb3/tvmjs-monorepo/tree/master/packages/tvm).
