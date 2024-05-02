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
    fundManagerAddress: "0x2AB6D6c328978D0DCC5a9ac0BA04E45e358e3B9a",
    fiberRouterAddress: "0x8d8559221D55338369C1B305A58eb86fdcE3B8b9",
    foundaryTokenAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    aggregateRouterContractAddress:
      "0x111111125421ca6dc452d289314280a0f8842a65",
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
  return threshold * 2;
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
