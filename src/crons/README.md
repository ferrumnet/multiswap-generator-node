# index.ts

The `index.ts` file within the `src/crons` directory of the `ferrumnet/multiswap-generator-node` repository serves as a central point for exporting cron job modules. This file essentially organizes and makes accessible the cron jobs defined in the project for periodic tasks.

rpcNode.job.ts
============================

The `rpcNode.job.ts` file defines a scheduled task to fetch and save RPC (Remote Procedure Call) node data at regular intervals. This functionality is crucial for maintaining an up-to-date list of RPC nodes, which are essential for interacting with blockchain networks.

Functions Overview
------------------

### rpcNodeJob

-   Purpose: Serves as the main function to be exported and executed, initiating the scheduling of the RPC node update task.
-   Implementation: Invokes the `start` function to begin the scheduled task.

### start

-   Purpose: Initializes a cron job that triggers at a set interval to execute RPC node update tasks.
-   Implementation Details:
    -   Cron Schedule: Configured to trigger every 10 seconds (`"*/10 * * * * *"`). This interval can be adjusted to meet system requirements or minimize network load.
    -   Task Execution: On each trigger, the `triggerJobs` function is called.
    -   Error Handling: Catches and logs any exceptions encountered during the cron job setup.

### triggerJobs

-   Purpose: Fetches RPC node data from a predefined source and logs the count of nodes fetched. Subsequently, it hands over the data to the `handleJob` function for further processing.
-   Flow:
    -   Fetches RPC node data by calling the `axiosService.getRpcNodes()`.
    -   Logs the number of RPC nodes fetched.
    -   Invokes `handleJob` with the fetched data.

### handleJob

-   Purpose: Saves the fetched RPC node data into a storage or cache mechanism for further use by the application.
-   Parameters:
    -   `data` ([RpcNode]): An array of RPC node objects to be saved.
-   Implementation Details: Utilizes the `rpcNodeService.saveRpcNodes` function to save the provided RPC node data.

Conclusion
----------

The `rpcNode.job.ts` module plays a critical role in ensuring the multiswap-generator-node application maintains a current list of RPC nodes for blockchain network interactions. By regularly updating this information, the application can provide reliable and efficient service to its users. The module leverages node-cron for scheduling, axios for data fetching, and custom service layers for data handling, demonstrating a structured approach to asynchronous job execution within a Node.js environment.

transactions.job.ts Documentation
=================================

Overview
--------

The `transactions.job.ts` file is a part of the cron job system within the `multiswap-generator-node` project. It primarily focuses on periodically fetching and processing transaction data. This documentation details the functionality implemented in this file.

Functions
---------

### transactionsJob

-   Purpose: The main exported function that initiates the cron job.
-   Implementation: Invokes the `start` function to begin the transaction monitoring and processing cycle.

### start

-   Purpose: Schedules and starts a cron job to run every 5 seconds, checking and processing new transactions if the system is not already processing a batch.
-   Logic:
    -   A cron job is scheduled using the `node-cron` package to run at a specified interval.
    -   The job checks if `isProccessRunning` is `false` and if there are RPC nodes data available before proceeding.
    -   Triggers `triggerJobs` to process new transactions.

### triggerJobs

-   Purpose: Fetches new transactions and processes each one individually.
-   Logic:
    -   Calls `axiosService.getTransactions()` to retrieve new transactions.
    -   Sets `isProccessRunning` to `true` to indicate that the job is currently processing transactions.
    -   Iterates over each transaction, passing it to `handleJob` for processing.
    -   Resets `isProccessRunning` to `false` after all transactions are processed.

### handleJob

-   Purpose: Processes an individual transaction by checking its uniqueness and fetching relevant chain data.
-   Parameters:
    -   `transaction`: The transaction object to be processed.
-   Logic:
    -   Checks if the transaction's receiveTransactionId is already in the local cache.
    -   If not present, adds it to the local cache and calls `transactionService.fetchChainDataFromNetwork(transaction)` to process the transaction data.

### addTransactionHashInLocalList

-   Purpose: Adds a transaction hash to the local cache to prevent reprocessing.
-   Parameters:
    -   `hash`: The transaction hash to add to the cache.

### removeTransactionHashFromLocalList

-   Purpose: Removes a transaction hash from the local cache.
-   Parameters:
    -   `hash`: The transaction hash to remove from the cache.

### isHashInLocalList

-   Purpose: Checks if a transaction hash is already in the local cache.
-   Parameters:
    -   `hash`: The transaction hash to check.
-   Returns: `boolean`: `true` if the hash is found in the cache, otherwise `false`.

Conclusion
----------

The `transactions.job.ts` file implements a cron job for the `multiswap-generator-node` project, designed to periodically check for and process new transactions. It ensures that transactions are uniquely processed and handles the fetching of chain data for each transaction. This system plays a crucial role in maintaining the application's transaction data up-to-date and reduces redundant processing through local caching mechanisms.