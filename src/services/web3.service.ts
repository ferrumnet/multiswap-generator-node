import Web3 from "web3";
import { TransactionReceipt, Transaction } from "../interfaces";
import { signatureService } from "./index";
import { abi as contractABI } from "../constants/FiberRouter.json";
import { NETWORKS, CUDOS_CHAIN_ID, delay } from "../constants/constants";

export const getTransactionReceipt = async (
  txId: string,
  rpcURL: string,
  threshold: number,
  tries = 0
): Promise<TransactionReceipt> => {
  const web3 = new Web3(rpcURL);
  const transaction: TransactionReceipt = await web3.eth.getTransactionReceipt(
    txId
  );
  console.log("transaction", transaction?.status, txId, tries);
  if (tries < threshold) {
    tries += 1;
    if (!transaction || transaction === null || transaction.status === null) {
      await delay();
      await getTransactionReceipt(txId, rpcURL, threshold, tries);
    }
  }
  return transaction;
};

export const getTransactionByHash = async (
  txHash: string,
  rpcURL: string
): Promise<Transaction> => {
  const web3 = new Web3(rpcURL);
  return web3.eth.getTransaction(txHash);
};

export const signedTransaction = async (
  job: any,
  decodedData: any,
  transaction: any
): Promise<any> => {
  try {
    const web3 = new Web3(job.data.sourceRpcURL);
    const destinationAmountToMachine = await getDestinationAmount(decodedData);
    let txData = await signatureService.getDataForSignature(
      job,
      decodedData,
      transaction
    );

    txData.salt = Web3.utils.keccak256(
      txData.transactionHash.toLocaleLowerCase()
    );

    const signature = signatureService.createSignedPayment(
      txData.targetChainId,
      txData.targetAddress,
      destinationAmountToMachine,
      txData.targetToken,
      txData.fundManagerContractAddress,
      txData.salt,
      txData.destinationAssetType,
      txData.destinationAmountIn,
      txData.destinationAmountOut,
      txData.targetFoundaryToken,
      txData.destinationOneInchData,
      txData.expiry,
      web3
    );

    return {
      ...txData,
      signatures: [
        {
          signature: signature.signature,
          hash: signature.hash,
        },
      ],
    };
  } catch (error) {
    console.error("Error occured while decoding transaction", error);
  }
};

export const getLogsFromTransactionReceipt = (job: any) => {
  let logDataAndTopic = undefined;

  if (job?.returnvalue?.logs?.length) {
    for (const log of job.returnvalue.logs) {
      if (log?.topics?.length) {
        const topicIndex = findSwapEvent(log.topics, job);
        if (topicIndex !== undefined && topicIndex >= 0) {
          logDataAndTopic = {
            data: log.data,
            topics: log.topics,
          };
          break;
        }
      }
    }

    let swapEventInputs = contractABI.find(
      (abi) => abi.name === "Swap" && abi.type === "event"
    )?.inputs;

    if (job.data.isDestinationNonEVM != null && job.data.isDestinationNonEVM) {
      swapEventInputs = contractABI.find(
        (abi) => abi.name === "NonEvmSwap" && abi.type === "event"
      )?.inputs;
    }

    if (logDataAndTopic?.data && logDataAndTopic.topics) {
      const web3 = new Web3(job.data.sourceRpcURL);

      const decodedLog = web3.eth.abi.decodeLog(
        swapEventInputs as any,
        logDataAndTopic.data,
        logDataAndTopic.topics.slice(1)
      );

      return decodedLog;
    }
  }
};

const findSwapEvent = (topics: any[], job: any) => {
  let swapEventHash = Web3.utils.sha3(
    "Swap(address,address,uint256,uint256,uint256,address,address,uint256,bytes32)"
  );
  if (job.data.isDestinationNonEVM != null && job.data.isDestinationNonEVM) {
    swapEventHash = Web3.utils.sha3(
      "NonEvmSwap(address,string,uint256,string,uint256,address,string)"
    );
  }

  if (topics?.length) {
    return topics.findIndex((topic) => topic === swapEventHash);
  } else {
    return undefined;
  }
};

export const getFundManagerAddress = (chainId: string) => {
  if (NETWORKS && NETWORKS.length > 0) {
    let item = NETWORKS.find((item: any) => item.chainId === chainId);
    return item ? item.fundManagerAddress : "";
  }
  return "";
};

export const getFiberRouterAddress = (chainId: string) => {
  if (NETWORKS && NETWORKS.length > 0) {
    let item = NETWORKS.find((item: any) => item.chainId === chainId);
    return item ? item.fiberRouterAddress : "";
  }
  return "";
};

export const getFoundaryTokenAddress = (
  sourceChainId: string,
  targetChainId: string,
  targetAddress: string
) => {
  if (sourceChainId == CUDOS_CHAIN_ID) {
    if (NETWORKS && NETWORKS.length > 0) {
      let item = NETWORKS.find((item: any) => item.chainId === targetChainId);
      return item ? item.foundaryTokenAddress : "";
    }
    return "";
  } else {
    return targetAddress;
  }
};

const getDestinationAmount = async (data: any) => {
  console.log("data.bridgeAmount", data.swapBridgeAmount);
  return data.swapBridgeAmount;
};
