# TRC-10 Token Opcodes

TRON lets a contract call carry a TRC-10 token alongside TRX. Five opcodes with no EVM equivalent
make that visible to contract code.

## The opcodes

| Opcode           | Code   | Description                                                |
| ---------------- | ------ | ---------------------------------------------------------- |
| `CALLTOKEN`      | `0xd0` | Call a contract, transferring a TRC-10 token with the call |
| `TOKENBALANCE`   | `0xd1` | Query the TRC-10 token balance of an address               |
| `CALLTOKENVALUE` | `0xd2` | Token value attached to the current call                   |
| `CALLTOKENID`    | `0xd3` | Token ID attached to the current call                      |
| `ISCONTRACT`     | `0xd4` | Whether an address is a contract                           |

## Token IDs are range-checked, not existence-checked

`CALLTOKEN` and `TOKENBALANCE` validate only that the token ID is **in range**. They do not require
`StateManager.tokenIdExists()` and do not reject an ID just because it is unissued. Within the
precision limit below, an unissued ID continues execution or returns zero.

This matches `java-tron`. Code written against 1.0.0 that expected an unissued ID to throw will see
different behaviour.

## Token ID precision limit in 1.1.0 {#token-id-precision-limit}

::: warning Range validation does not guarantee lossless token IDs
TVMJS 1.1.0 accepts token IDs within the protocol's signed 64-bit range, but converts IDs to
JavaScript `number` values when accessing account token balances. IDs above
`Number.MAX_SAFE_INTEGER` (`9007199254740991`) can lose precision: different IDs can resolve to
the same balance key, causing incorrect balance reads or transfers.

Applications should reject IDs above this limit before passing them to TVMJS. Validate the original
integer using `bigint` or another lossless representation, before converting it to `number`.
Passing a `bigint` alone does not avoid TVMJS's internal conversion. This additional upper bound
does not replace the existing protocol range checks.

Contract execution can also produce token IDs internally. If execution accesses IDs above this
limit, do not rely on its token balances or transfer results, even if the initial inputs passed
validation. This is a current implementation limitation, not a restriction of the TRON protocol.
:::

## Transfers at the message level

`tokenId` and `tokenValue` are fields on `Message`, so token transfers apply to both calls and
contract creation. An insufficient token balance raises `INSUFFICIENT_TOKEN_BALANCE` rather than
underflowing.

Two TRON-specific errors guard self-transfers:

- `CAN_NOT_TRANSFER_TRX_YOURSELF`
- `CAN_NOT_TRANSFER_ASSET_YOURSELF`

## Transaction-level transfers

`tokenId` and `tokenValue` are carried by the **signed legacy transaction format**.

::: warning Typed transactions reject token fields
Nonzero `tokenId` / `tokenValue` are rejected on EIP-2930, EIP-1559, EIP-4844 and EIP-7702
transactions. Those formats do not include the fields in their signing payload or serialisation, so
accepting them would produce a signature that does not commit to the transfer.
:::

## Nonce interaction

The shared TRON internal nonce is **not** advanced when `CALLTOKEN` is rejected for insufficient
token balance. See [Addresses](/tron/addresses#the-internal-nonce) for what the internal nonce
drives.
