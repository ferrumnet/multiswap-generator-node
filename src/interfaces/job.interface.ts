import { Transaction, TransactionReceipt } from "../interfaces";

export interface JobRequestBody {
  name: string;
  sourceRpcURL: string;
  isSourceNonEVM: boolean;
  destinationRpcURL: string;
  isDestinationNonEVM: boolean;
  bridgeAmount: string;
  txId: string;
  threshold: number;
  sourceAssetType: string;
  destinationAssetType: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  sourceOneInchData: string;
  destinationOneInchData: string;
}

export interface UpdateJobRequestBody {
  transaction: Transaction;
  transactionReceipt: TransactionReceipt;
}
