export {};
var cron = require("node-cron");
import moment from "moment";
import { axiosService, transactionService } from "../services/index";
import { getRpcNodesData } from "../constants/constants";
let isProccessRunning = false;
let localTransactionHashes: any = [];

export let transactionsJob = async function () {
  start();
};

async function start() {
  try {
    let task = cron.schedule("*/10 * * * * *", async () => {
      console.log(moment().utc(), "::: transaction");
      if (!isProccessRunning && getRpcNodesData()?.length > 0) {
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
      handleJob(transaction);
    }
    isProccessRunning = false;
  }
}

export function handleJob(transaction: any) {
  if (isHashInLocalList(transaction.receiveTransactionId) == false) {
    addTransactionHashInLocalList(transaction.receiveTransactionId);
    transactionService.fetchChainDataFromNetwork(transaction);
  }
}

function addTransactionHashInLocalList(hash: any) {
  localTransactionHashes?.push(hash);
  console.log(localTransactionHashes?.length);
}

export function removeTransactionHashFromLocalList(hash: any) {
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
