# index.ts

The `index.ts` file within the `src/interfaces` directory of the `ferrumnet/multiswap-generator-node` repository serves as a central point for exporting modules. This file essentially organizes and makes accessible the defined modules in the project for periodic tasks.

# job.interface.ts

### `JobRequestBody`

This interface represents the body of a job request. It is structured to contain all necessary information needed to process a job:

- `name`: A string representing the name of the job.
- `isSourceNonEVM`: A boolean indicating if the source blockchain is a non-EVM (Ethereum Virtual Machine) compatible blockchain.
- `destinationRpcURL`: A string specifying the RPC URL of the destination blockchain.
- `isDestinationNonEVM`: A boolean indicating if the destination blockchain is a non-EVM compatible blockchain.
- `bridgeAmount`: A string representing the amount to be bridged.
- `txId`: A string that represents the transaction ID.
- `threshold`: A number indicating the threshold for something (not explicitly mentioned, but typically thresholds are used for validations or limits).
- `sourceAssetType`: A string representing the type of asset in the source chain.
- `destinationAssetType`: A string representing the type of asset in the destination chain.
- `destinationAmountIn`: A string representing the amount of the asset before conversion in the destination chain.
- `destinationAmountOut`: A string representing the amount of the asset after conversion in the destination chain.
- `sourceOneInchData`: A string containing data for executing swaps via 1inch on the source chain.
- `destinationOneInchData`: A string containing data for executing swaps via 1inch on the destination chain.
- `targetToken`: A string representing the token targeted for the swap.
- `sourceChainId`: A string representing the ID of the source blockchain.
- `destinationChaibId`: A string (with a typo, should be `destinationChainId`) representing the ID of the destination blockchain.
- `slippage`: A number indicating the allowed slippage percentage for the transaction.
- `isSameNetworkSwap`: A boolean indicating if the swap is form same network.
- `isCCTP`: A boolean indicating if the swap is form CCTP protocol.

### `UpdateJobRequestBody`

This interface is designed to update a job request with transaction details:

- `transaction`: An object of type `Transaction` representing the transaction details.
- `transactionReceipt`: An object of type `TransactionReceipt` representing the receipt of the transaction.

### `RpcNode`

Defines the structure for an RPC node configuration:

- `url`: A string specifying the RPC URL of the node.
- `chainId`: A string representing the blockchain ID the node connects to.

These interfaces are crucial for ensuring type safety and consistency within the application, especially when handling job requests that involve transactions across blockchains.

# web3.interface.ts

### `Transaction` Interface

This interface represents a blockchain transaction and includes the following properties:

- `hash`: The unique identifier of the transaction as a string.
- `nonce`: The nonce of the transaction, indicating the number of transactions sent from the sender's address.
- `blockHash`: The hash of the block that contains this transaction. It is null if the transaction is pending.
- `blockNumber`: The number of the block that contains this transaction. It is null if the transaction is pending.
- `transactionIndex`: The index of the transaction in the block. It is null if the transaction is pending.
- `from`: The address of the sender.
- `to`: The address of the receiver. It can be null for contract creation transactions.
- `value`: The amount of Ether (in wei) transferred in the transaction.
- `gasPrice`: The gas price provided by the sender in wei.
- `maxPriorityFeePerGas`: An optional field representing the maximum priority fee per gas that the transaction may pay. This property is part of EIP-1559.
- `maxFeePerGas`: An optional field representing the maximum fee per gas that the sender is willing to pay, including the base fee and priority fee. This property is also part of EIP-1559.
- `gas`: The amount of gas provided for the transaction.
- `input`: The data sent along with the transaction.

### `TransactionReceipt` Interface

This interface represents the receipt of a transaction, containing details about the execution outcome and is defined with the following properties:

- `status`: A boolean indicating whether the transaction was successful.
- `transactionHash`: The hash of the transaction.
- `transactionIndex`: The transaction's index position in the block.
- `blockHash`: The hash of the block where this transaction was in.
- `blockNumber`: The block number where this transaction was in.
- `from`: The sender's address.
- `to`: The receiver's address.
- `contractAddress`: The contract address created if the transaction was a contract creation, otherwise undefined.
- `cumulativeGasUsed`: The total amount of gas used when this transaction was executed in the block.
- `gasUsed`: The amount of gas used by this specific transaction alone.
- `effectiveGasPrice`: The effective gas price used for this transaction.
- `logs`: An array of log objects generated during the execution of the transaction.
- `logsBloom`: The bloom filter for the logs of the block.
- `events`: An optional property that may contain the events generated during the execution if they are present.

### `EventLog` Interface

This interface describes an event log from the blockchain, which includes:

- `event`: The name of the event.
- `address`: The address from which this log originated.
- `returnValues`: The values returned by the event.
- `logIndex`: The log index position in the block.
- `transactionIndex`: The index of the transaction in the block.
- `transactionHash`: The hash of the transaction that generated this log.
- `blockHash`: The hash of the block where this log was generated.
- `blockNumber`: The block number where this log was generated.
- `raw`: An optional property that contains the raw data (`data`) and `topics` of the log.

### `Log` Interface

Represents a low-level log item, similar to `EventLog` but without the `event` property, used in the Ethereum Virtual Machine (EVM) logs:

- `address`: The address from which this log originated.
- `data`: The data sent with the log.
- `topics`: An array of topics associated with the log.
- `logIndex`: The log index position in the block.
- `transactionIndex`: The index of the transaction in the block.
- `transactionHash`: The hash of the transaction.
- `blockHash`: The hash of the block.
- `blockNumber`: The block number.
- `removed`: A boolean indicating if the log was removed due to a chain reorganization.
