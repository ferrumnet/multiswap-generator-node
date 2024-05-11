import moment from "moment";
import { RpcNode } from "../interfaces/index";
var crypto = require("crypto");
var CryptoJS = require("crypto-js");

export const NAME = "FUND_MANAGER";
export const VERSION = "000.004";
export const CUDOS_CHAIN_ID = "cudos-1";
export const FOUNDARY = "Foundary";
export const ONE_INCH = "1Inch";
export let SECURITY_KEY = "";
export const BEARER = "Bearer ";
let rpcNodes: [RpcNode];
export const NETWORKS = [
  {
    chainId: "1",
    fundManagerAddress: "0x5eBeF0bD015e4fAfe64172Ae00b9bB46a05906a7",
    fiberRouterAddress: "0x4B87Ab46B56990Aff03dAD1caFEb33e760879d97",
    foundaryTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    aggregateRouterContractAddress: "",
  },
  {
    chainId: "56",
    fundManagerAddress: "0xB4A5D95BFEC6AFd359e05aA982718C11bF04a7Ff",
    fiberRouterAddress: "0xbB1886FA834917716049094090387DEa0680BFFc",
    foundaryTokenAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    aggregateRouterContractAddress:
      "0x111111125421ca6dc452d289314280a0f8842a65",
  },
  {
    chainId: "42161",
    fundManagerAddress: "0xC7b23d5Da44f3d421aD27863788bEdcce4b34B0d",
    fiberRouterAddress: "0x68902Ec3058fdBb37Ac3D832a62112d7764a08ed",
    foundaryTokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    aggregateRouterContractAddress:
      "0x111111125421ca6dc452d289314280a0f8842a65",
    cctpFundManager: "0x7bD02622F39E458D5d5eaAD51C304Cac064ACFf4",
  },
  {
    chainId: "10",
    fundManagerAddress: "0x7655eE1bd794b0Fe4b9B4D477B0F5cCABD78137c",
    fiberRouterAddress: "0x6a34da798839964e14850F585187f3d28079a500",
    foundaryTokenAddress: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    aggregateRouterContractAddress: "",
  },
  {
    chainId: "43114",
    fundManagerAddress: "0x41eFd89cbeaCeCdf72d3fD8321C53A69A132CC1a",
    fiberRouterAddress: "0x9cc84e262E3A2A6b8C257d493E3d3487495fb5a2",
    foundaryTokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    aggregateRouterContractAddress: "",
  },
  {
    chainId: "8453",
    fundManagerAddress: "0x7022a2dE2434AbA5985e87A84E93E5C9Cc3AB05F",
    fiberRouterAddress: "0x84250F8d4617485C3D5f1d7b1bC8C624e5695A80",
    foundaryTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    aggregateRouterContractAddress:
      "0x111111125421ca6dc452d289314280a0f8842a65",
    cctpFundManager: "0x7EA16f3a967db7133D50807e5Fb3ca5FBc4A3dD6",
  },
  {
    chainId: "324",
    fundManagerAddress: "0x09a3078fdb233e3De911cFba3D49D6902d29E36F",
    fiberRouterAddress: "0x60ACb601eaE3ec5F9BC7679F20128b07Fc703Dbd",
    foundaryTokenAddress: "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4",
    aggregateRouterContractAddress:
      "0x6fd4383cb451173d5f9304f041c7bcbf27d561ff",
  },
  {
    chainId: "534352",
    fundManagerAddress: "0xb28d89D2B218ced7B64272CD61036F655c2573e4",
    fiberRouterAddress: "0x35dA469ECbFFCBfaF8cAC31Fe0645B158e252Eb6",
    foundaryTokenAddress: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    aggregateRouterContractAddress:
      "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  },
];

export const getSecurityKey = function () {
  return (
    (global as any).AWS_ENVIRONMENT.SECURITY_KEY + process.env.SECURITY_KEY
  );
};

export const getPrivateKey = function () {
  const privateKey = process.env.PRIVATE_KEY as string;
  const securityKey = getSecurityKey();
  return decrypt(privateKey, securityKey);
};

export const createAuthTokenForMultiswapBackend = function () {
  let timelapse = 1;
  let currentTime = new Date();
  let startDateTime = moment(currentTime)
    .subtract("minutes", timelapse)
    .utc()
    .format();
  let endDateTime = moment(currentTime)
    .add("minutes", timelapse)
    .utc()
    .format();
  let randomKey = crypto.randomBytes(512).toString("hex");
  let tokenBody: any = {};
  tokenBody.startDateTime = startDateTime;
  tokenBody.endDateTime = endDateTime;
  tokenBody.randomKey = randomKey;

  let strTokenBody = JSON.stringify(tokenBody);
  let encryptedSessionToken = encrypt(
    strTokenBody,
    (global as any).AWS_ENVIRONMENT.API_KEY
  );
  return encryptedSessionToken;
};

export const encrypt = function (data: string, key: String) {
  try {
    var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
  } catch (e) {
    console.log(e);
    return "";
  }
};

export const decrypt = function (data: string, key: string) {
  try {
    var bytes = CryptoJS.AES.decrypt(data, key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (e) {
    console.log(e);
    return "";
  }
};

export const getThreshold = function (threshold: number) {
  return threshold * 4;
};

export const getExipry = function () {
  return moment().utc().add("week", 1).unix();
};

export const setRpcNodesData = function (data: [RpcNode]) {
  rpcNodes = data;
};

export const getRpcNodesData = function () {
  return rpcNodes;
};
