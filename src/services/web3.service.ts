import Web3 from "web3";
import { TransactionReceipt, Transaction } from "../interfaces";
import { abi as contractABI } from "../constants/FiberRouter.json";
import {
  NAME,
  VERSION,
  NETWORKS,
  CUDOS_CHAIN_ID,
  FOUNDARY,
  ONE_INCH,
  getPrivateKey,
  delay,
  getExipry,
} from "../constants/constants";
import { ecsign, toRpcSig } from "ethereumjs-util";

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
    let txData = await getDataForSignature(job, decodedData, transaction);

    txData.salt = Web3.utils.keccak256(
      txData.transactionHash.toLocaleLowerCase()
    );

    const signature = createSignedPayment(
      txData.targetChainId,
      txData.targetAddress,
      destinationAmountToMachine,
      txData.targetToken,
      txData.fundManagerContractAddress,
      txData.salt,
      txData.destinationAssetType,
      txData.amountIn,
      txData.amountOut,
      txData.targetFoundaryToken,
      txData.destinationOneInchData,
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

const createSignedPayment = (
  chainId: string,
  payee: string,
  amount: string,
  targetToken: string,
  contractAddress: string,
  salt: string,
  destinationAssetType: string,
  amountIn: string,
  amountOut: string,
  targetFoundaryToken: string,
  oneInchData: string,
  web3: Web3
) => {
  let hash;
  if (destinationAssetType == FOUNDARY) {
    hash = produceFoundaryHash(
      web3,
      chainId,
      contractAddress,
      targetFoundaryToken,
      payee,
      amount,
      salt
    );
  } else if (destinationAssetType == ONE_INCH) {
    hash = produceOneInchHash(
      web3,
      chainId,
      contractAddress,
      payee,
      amountIn,
      amountOut,
      targetFoundaryToken,
      targetToken,
      oneInchData,
      salt
    );
  }
  const privateKey = getPrivateKey();
  const ecSign = ecsign(
    Buffer.from(hash.replace("0x", ""), "hex"),
    Buffer.from(privateKey.replace("0x", ""), "hex")
  );
  const signature = fixSig(toRpcSig(ecSign.v, ecSign.r, ecSign.s));
  return { signature, hash };
};

const produceFoundaryHash = (
  web3: Web3,
  chainId: string,
  contractAddress: string,
  token: string,
  payee: string,
  amount: string,
  swapTxId: string
): any => {
  const methodHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "WithdrawSigned(address token,address payee,uint256 amount,bytes32 salt,uint256 expiry)"
    )
  );
  const params = [
    "bytes32",
    "address",
    "address",
    "uint256",
    "bytes32",
    "uint256",
  ];
  const structure = web3.eth.abi.encodeParameters(params, [
    methodHash,
    token,
    payee,
    amount,
    swapTxId,
    getExipry(),
  ]);
  const structureHash = Web3.utils.keccak256(structure);
  const ds = domainSeparator(web3, chainId, contractAddress);
  const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
  return hash;
};

const produceOneInchHash = (
  web3: Web3,
  chainId: string,
  contractAddress: string,
  payee: string,
  amountIn: string,
  amountOut: string,
  foundryToken: string,
  targetToken: string,
  oneInchData: string,
  salt: string
): any => {
  const methodHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "WithdrawSignedOneInch(address to,uint256 amountIn,uint256 amountOut,address foundryToken,address targetToken, bytes oneInchData, bytes32 salt, uint256 expiry)"
    )
  );
  const params = [
    "bytes32",
    "address",
    "uint256",
    "uint256",
    "address",
    "address",
    "bytes",
    "bytes32",
    "uint256",
  ];
  const structure = web3.eth.abi.encodeParameters(params, [
    methodHash,
    payee,
    amountIn,
    amountOut,
    foundryToken,
    targetToken,
    oneInchData,
    salt,
    getExipry(),
  ]);
  const structureHash = Web3.utils.keccak256(structure);
  const ds = domainSeparator(web3, chainId, contractAddress);
  const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
  return hash;
};

const domainSeparator = (
  web3: Web3,
  chainId: string,
  contractAddress: string
) => {
  const hashedName = Web3.utils.keccak256(Web3.utils.utf8ToHex(NAME));
  const hashedVersion = Web3.utils.keccak256(Web3.utils.utf8ToHex(VERSION));
  const typeHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    )
  );
  return Web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [typeHash, hashedName, hashedVersion, chainId, contractAddress]
    )
  );
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

const fixSig = (sig: any) => {
  const rs = sig.substring(0, sig.length - 2);
  let v = sig.substring(sig.length - 2);
  if (v === "00" || v === "37" || v === "25") {
    v = "1b";
  } else if (v === "01" || v === "38" || v === "26") {
    v = "1c";
  }
  return rs + v;
};

const getFundManagerAddress = (chainId: string) => {
  if (NETWORKS && NETWORKS.length > 0) {
    let item = NETWORKS.find((item: any) => item.chainId === chainId);
    return item ? item.fundManagerAddress : "";
  }
  return "";
};

const getFiberRouterAddress = (chainId: string) => {
  if (NETWORKS && NETWORKS.length > 0) {
    let item = NETWORKS.find((item: any) => item.chainId === chainId);
    return item ? item.fiberRouterAddress : "";
  }
  return "";
};

const getFoundaryTokenAddress = (
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

const getDataForSignature = (
  job: any,
  decodedData: any,
  transaction: any
): any => {
  const withdrawlData = getValidWithdrawlData(
    job.data,
    decodedData.withdrawlData
  );
  const txData = {
    transactionHash: job.returnvalue.transactionHash,
    from: transaction.from,
    token: decodedData.sourceToken,
    amount: decodedData.sourceAmount,
    fundManagerContractAddress: getFundManagerAddress(
      decodedData.targetChainId
    ),
    fiberRouterAddress: getFiberRouterAddress(decodedData.targetChainId),
    chainId: decodedData.sourceChainId,
    targetChainId: decodedData.targetChainId,
    targetToken: decodedData.targetToken,
    targetFoundaryToken: getFoundaryTokenAddress(
      decodedData.sourceChainId,
      decodedData.targetChainId,
      decodedData.targetToken
    ),
    targetAddress: decodedData.targetAddress,
    signatures: [],
    salt: "",
    sourceAssetType: job.data.sourceAssetType,
    destinationAssetType: job.data.destinationAssetType,
    amountIn: withdrawlData?.amountIn,
    amountOut: withdrawlData?.amountOut,
    destinationOneInchData: withdrawlData?.destinationOneInchData,
  };
  return txData;
};

const getValidWithdrawlData = (data: any, withdrawlDataHash: string): any => {
  let latestHash = Web3.utils.keccak256(
    data.sourceOneInchData +
      data.destinationOneInchData +
      data.amountIn +
      data.amountOut +
      data.sourceAssetType +
      data.destinationAssetType
  );
  console.log("latestHash", latestHash);
  console.log("withdrawlDataHash", withdrawlDataHash);
  if (latestHash == withdrawlDataHash) {
    return {
      sourceOneInchData: data.sourceOneInchData,
      destinationOneInchData: data.destinationOneInchData,
      amountIn: data.amountIn,
      amountOut: data.amountOut,
      sourceAssetType: data.sourceAssetType,
      destinationAssetType: data.destinationAssetType,
    };
  }
  return null;
};
