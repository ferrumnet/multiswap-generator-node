export {};
var cron = require("node-cron");
import moment from "moment";
import {
  axiosService,
  web3Service,
  cosmWasmService,
} from "./../../services/index";
import { JobRequestBody } from "./../../interfaces/index";
let isProccessRunning = false;
let localTransactionHashes: any = [];

let transactionsJob = async function () {
  start();
};

async function start() {
  try {
    let task = cron.schedule("*/20 * * * * *", async () => {
      console.log(moment().utc(), ":::");
      if (!isProccessRunning) {
        console.log("getTransaction cron triggered:::");
        triggerJobs();
      }
    });

    task.start();
  } catch (e) {
    console.log(e);
  }
}

async function triggerJobs() {
  let transactions = await axiosService.getTransactions();
  console.log(transactions?.length);
  if (transactions && transactions?.length > 0) {
    isProccessRunning = true;
    for (const transaction of transactions) {
      addWorker(transaction);
    }
    isProccessRunning = false;
  }
}

export function addWorker(transaction: any) {
  if (isHashInLocalList(transaction.receiveTransactionId) == false) {
    addTransactionHashInLocalList(transaction.receiveTransactionId);
    workerForFetchChainDataFromNetwork(transaction);
  }
}

async function workerForFetchChainDataFromNetwork(tx: any) {
  if (tx) {
    let sourceNetwork = tx.sourceNetwork;
    let destinationNetwork = tx.destinationNetwork;
    let sourceRpc = sourceNetwork.multiswapNetworkFIBERInformation.rpcUrl;
    let destinationRpc =
      destinationNetwork.multiswapNetworkFIBERInformation.rpcUrl;

    let data: JobRequestBody = {
      name: "",
      sourceRpcURL: sourceRpc,
      isSourceNonEVM: sourceNetwork.isNonEVM,
      destinationRpcURL: destinationRpc,
      isDestinationNonEVM: destinationNetwork.isNonEVM,
      bridgeAmount: tx.bridgeAmount,
      txId: tx.receiveTransactionId,
    };

    let job: any = { data: data };

    if (job.data.isSourceNonEVM) {
      console.log("======================");
      console.log("source is Non EVM");
      job.returnvalue = await cosmWasmService.getTransactionReceipt(
        job.data.txId,
        job.data.sourceRpcURL
      );
    } else {
      console.log("======================");
      console.log("source is EVM");
      job.returnvalue = await web3Service.getTransactionReceipt(
        job.data.txId,
        job.data.sourceRpcURL
      );
    }

    if (job?.returnvalue?.status == true) {
      await workerForSignature(job);
    } else {
      console.info(`failed!`);
      await updateTransaction(job, null, null);
    }
  }
}

async function workerForSignature(job: any) {
  try {
    let decodedData;
    let tx: any = {};
    let signedData;
    console.info(`completed!`);
    if (job.data.isSourceNonEVM != null && job.data.isSourceNonEVM) {
      decodedData = cosmWasmService.getLogsFromTransactionReceipt(job);
      tx.from = decodedData.from;
      tx.hash = job.returnvalue.transactionHash;
    } else {
      decodedData = web3Service.getLogsFromTransactionReceipt(job);
      tx = await web3Service.getTransactionByHash(
        job.data.txId,
        job.data.sourceRpcURL
      );
    }
    console.info("decodedData", decodedData);

    if (job.data.isDestinationNonEVM != null && job.data.isDestinationNonEVM) {
      signedData = await cosmWasmService.signedTransaction(
        job,
        decodedData,
        tx
      );
    } else {
      signedData = await web3Service.signedTransaction(job, decodedData, tx);
    }

    console.log("signedData", job.returnvalue.status, signedData);
    await updateTransaction(job, signedData, tx);
  } catch (error) {
    console.error("error occured", error);
  }
}

async function updateTransaction(job: any, signedData: any, tx: any) {
  try {
    console.log("signedData", job.returnvalue.status, signedData);
    await axiosService.updateTransactionJobStatus(job?.data?.txId, {
      signedData,
      transaction: tx,
      transactionReceipt: job?.returnvalue,
    });
    removeTransactionHashFromLocalList(job?.data?.txId);
  } catch (error) {
    console.error("error occured", error);
  }
}

function addTransactionHashInLocalList(hash: any) {
  localTransactionHashes?.push(hash);
  console.log(localTransactionHashes?.length);
}

function removeTransactionHashFromLocalList(hash: any) {
  localTransactionHashes = localTransactionHashes?.filter(
    (item: string) => item !== hash
  );
  console.log(localTransactionHashes?.length);
}

function isHashInLocalList(hash: any): boolean {
  const found = localTransactionHashes?.find((item: any) => item == hash);
  console.log(found);
  if (found) {
    return true;
  } else {
    return false;
  }
}

export default transactionsJob;
