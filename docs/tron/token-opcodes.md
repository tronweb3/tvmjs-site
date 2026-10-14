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

`CALLTOKEN` and `TOKENBALANCE` validate only that the token ID is **in range**. Valid protocol token
IDs are integers satisfying `1000000 < id <= 2^63 - 1`. `CALLTOKEN` additionally accepts `0` to denote
that no token is transferred with the call.

They do not require `StateManager.tokenIdExists()` and do not reject an ID just because it is unissued:
an unissued ID within range continues execution or returns zero. Token IDs outside the valid range are
rejected.

This matches `java-tron`. Code written against 1.0.0 that expected an unissued ID to throw will see
different behaviour.

## Token ID precision {#token-id-precision-limit}

Starting in 1.2.0, TVMJS preserves full 64-bit token ID precision (`bigint`) across transactions,
account balances, serialization, and state management, preventing collisions above JavaScript's safe-integer
range (`Number.MAX_SAFE_INTEGER`).

::: tip Resolved in 1.2.0
In 1.1.0, token IDs were converted to JavaScript `number` values internally, which required
applications to reject token IDs above `Number.MAX_SAFE_INTEGER` (`9007199254740991`). In 1.2.0,
TVMJS losslessly represents and operates on the complete protocol integer range (`1000000 < id <= 2^63 - 1`,
plus `0` for `CALLTOKEN`) without key collisions or precision loss.
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
Nonzero `tokenId` / `tokenValue` are rejected on retained typed transactions (EIP-2930 and EIP-1559).
Those formats do not include the fields in their signing payload or serialisation, so accepting them
would produce a signature that does not commit to the transfer. Unsupported Ethereum formats like
EIP-4844 and EIP-7702 are rejected entirely at transaction and block entry points.
:::

## Nonce interaction

The shared TRON internal nonce is **not** advanced when `CALLTOKEN` is rejected for insufficient
token balance. See [Addresses](/tron/addresses#the-internal-nonce) for what the internal nonce
drives.
