import Web3 from "web3";
import { web3Service } from "./index";
import {
  NAME,
  VERSION,
  NETWORKS,
  CUDOS_CHAIN_ID,
  FOUNDARY,
  ONE_INCH,
  getPrivateKey,
  getExipry,
} from "../constants/constants";
import { ecsign, toRpcSig } from "ethereumjs-util";

export const getDataForSignature = (
  job: any,
  decodedData: any,
  transaction: any
): any => {
  const withdrawalData = getValidWithdrawalData(
    job.data,
    decodedData.withdrawlData
  );
  const txData = {
    transactionHash: job.returnvalue.transactionHash,
    from: transaction.from,
    token: decodedData.sourceToken,
    amount: decodedData.sourceAmount,
    fundManagerContractAddress: web3Service.getFundManagerAddress(
      decodedData.targetChainId
    ),
    fiberRouterAddress: web3Service.getFiberRouterAddress(
      decodedData.targetChainId
    ),
    chainId: decodedData.sourceChainId,
    targetChainId: decodedData.targetChainId,
    targetToken: job.data.targetToken,
    targetFoundaryToken: web3Service.getFoundaryTokenAddress(
      decodedData.sourceChainId,
      decodedData.targetChainId,
      decodedData.targetToken
    ),
    targetAddress: decodedData.targetAddress,
    signatures: [],
    salt: "",
    sourceAssetType: job.data.sourceAssetType,
    destinationAssetType: job.data.destinationAssetType,
    destinationAmountIn: withdrawalData?.destinationAmountIn,
    destinationAmountOut: withdrawalData?.destinationAmountOut,
    sourceOneInchData: withdrawalData?.sourceOneInchData,
    destinationOneInchData: withdrawalData?.destinationOneInchData,
    withdrawalData: decodedData.withdrawlData,
    expiry: getExipry(),
  };
  return txData;
};

export const getValidWithdrawalData = (
  data: any,
  withdrawlDataHash: string
): any => {
  let latestHash = Web3.utils.keccak256(
    data.sourceOneInchData +
      data.destinationOneInchData +
      data.destinationAmountIn +
      data.destinationAmountOut +
      data.sourceAssetType +
      data.destinationAssetType
  );
  console.log(
    "data",
    data.destinationAmountIn,
    data.destinationAmountOut,
    data.sourceAssetType,
    data.destinationAssetType
  );
  console.log("latestHash", latestHash);
  console.log("withdrawlDataHash", withdrawlDataHash);
  if (latestHash == withdrawlDataHash) {
    return {
      sourceOneInchData: data.sourceOneInchData,
      destinationOneInchData: data.destinationOneInchData,
      destinationAmountIn: data.destinationAmountIn,
      destinationAmountOut: data.destinationAmountOut,
      sourceAssetType: data.sourceAssetType,
      destinationAssetType: data.destinationAssetType,
    };
  }
  return null;
};

export const createSignedPayment = (
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
  expiry: number,
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
      salt,
      expiry
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
      salt,
      expiry
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

export const produceFoundaryHash = (
  web3: Web3,
  chainId: string,
  contractAddress: string,
  token: string,
  payee: string,
  amount: string,
  swapTxId: string,
  expiry: number
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
    expiry,
  ]);
  const structureHash = Web3.utils.keccak256(structure);
  const ds = domainSeparator(web3, chainId, contractAddress);
  const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
  return hash;
};

export const produceOneInchHash = (
  web3: Web3,
  chainId: string,
  contractAddress: string,
  payee: string,
  amountIn: string,
  amountOut: string,
  foundryToken: string,
  targetToken: string,
  oneInchData: string,
  salt: string,
  expiry: number
): any => {
  const methodHash = Web3.utils.keccak256(
    Web3.utils.utf8ToHex(
      "WithdrawSignedOneInch(address to,uint256 amountIn,uint256 amountOut,address foundryToken,address targetToken,bytes oneInchData,bytes32 salt,uint256 expiry)"
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
    expiry,
  ]);
  const structureHash = Web3.utils.keccak256(structure);
  const ds = domainSeparator(web3, chainId, contractAddress);
  const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
  return hash;
};

export const domainSeparator = (
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
