import { axiosService, web3Service } from "./index";
import { removeTransactionHashFromLocalList } from "../crons/transactions.job";
import { JobRequestBody } from "../interfaces/index";
import { getThreshold } from "../constants/constants";

export async function fetchChainDataFromNetwork(tx: any) {
  if (tx) {
    let sourceNetwork = tx.sourceNetwork;
    let destinationNetwork = tx.destinationNetwork;
    let sourceRpc = sourceNetwork.multiswapNetworkFIBERInformation.rpcUrl;
    let destinationRpc =
      destinationNetwork.multiswapNetworkFIBERInformation.rpcUrl;

    let data: JobRequestBody = {
      name: "",
      isSourceNonEVM: sourceNetwork.isNonEVM,
      destinationRpcURL: destinationRpc,
      isDestinationNonEVM: destinationNetwork.isNonEVM,
      bridgeAmount: tx.bridgeAmount,
      txId: tx.receiveTransactionId,
      threshold: sourceNetwork.threshold,
      sourceAssetType: tx.sourceAssetType,
      destinationAssetType: tx.destinationAssetType,
      destinationAmountIn: tx.destinationAmountIn,
      destinationAmountOut: tx.destinationAmountOut,
      sourceOneInchData: tx.sourceOneInchData,
      destinationOneInchData: tx.destinationOneInchData,
      targetToken: "",
      sourceChainId: sourceNetwork.chainId,
      destinationChaibId: destinationNetwork.chainId,
      slippage: tx.slippage,
      isSameNetworkSwap: isSameNetworksSwap(
        sourceNetwork.chainId,
        destinationNetwork.chainId
      ),
    };

    let job: any = { data: data };
    if (job.data.isSourceNonEVM) {
      // job.returnvalue = await cosmWasmService.getTransactionReceipt(
      //   job.data.txId,
      //   job.data.sourceRpcURL
      // );
    } else {
      job.returnvalue = await web3Service.getTransactionReceipt(
        job.data.txId,
        job.data.sourceChainId,
        getThreshold(job.data.threshold)
      );
    }
    if (job?.returnvalue?.status == true && job.data.isSameNetworkSwap) {
      let decodedData: any = web3Service.getLogsFromTransactionReceipt(job);
      decodedData.isSameNetworkSwap = job.data.isSameNetworkSwap;
      await updateTransaction(job, { ...decodedData }, null);
    } else if (job?.returnvalue?.status == true) {
      await createSignature(job);
    } else {
      console.info(`failed!`);
      await updateTransaction(job, null, null);
    }
  }
}

async function createSignature(job: any) {
  try {
    let decodedData;
    let tx: any = {};
    let signedData;

    if (job.data.isSourceNonEVM != null && job.data.isSourceNonEVM) {
      // decodedData = cosmWasmService.getLogsFromTransactionReceipt(job);
      // tx.from = decodedData.from;
      // tx.hash = job.returnvalue.transactionHash;
    } else {
      decodedData = web3Service.getLogsFromTransactionReceipt(job);
      tx = await web3Service.getTransactionByHash(
        job.data.txId,
        job.data.sourceChainId
      );
    }

    if (job.data.isDestinationNonEVM != null && job.data.isDestinationNonEVM) {
      // signedData = await cosmWasmService.signedTransaction(
      //   job,
      //   decodedData,
      //   tx
      // );
    } else {
      signedData = await web3Service.signedTransaction(job, decodedData, tx);
    }

    await updateTransaction(job, signedData, tx);
  } catch (error) {
    console.error("error occured", error);
  }
}

async function updateTransaction(job: any, signedData: any, tx: any) {
  try {
    console.log("signedData", signedData);
    await axiosService.updateTransaction(job?.data?.txId, {
      signedData,
      transaction: tx,
      transactionReceipt: job?.returnvalue,
    });
    removeTransactionHashFromLocalList(job?.data?.txId);
  } catch (error) {
    console.error("error occured", error);
  }
}

function isSameNetworksSwap(
  sourceNetworkChainId: string,
  destinationNetworkChainId: string
): boolean {
  if (sourceNetworkChainId == destinationNetworkChainId) {
    return true;
  } else {
    return false;
  }
}
