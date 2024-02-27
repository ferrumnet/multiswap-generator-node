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
    fundManagerAddress: "0x985824b8623e523162122461e081721b4bcc778b",
    fiberRouterAddress: "0x7FfD92b850c5660FB40BD5Efa4f24eb22665E4c4",
    foundaryTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    chainId: "56",
    fundManagerAddress: "0xaD8E49Eaa711905A4e3c12A49e44485330982e0F",
    fiberRouterAddress: "0xc56f2a1240f2aDfAc3c822D564260a524d059e0d",
    foundaryTokenAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  {
    chainId: "42161",
    fundManagerAddress: "0x6609c1Fe3055BEF578437A40Bd9E4140771B71Db",
    fiberRouterAddress: "0x5D85da8DE6179Bbd11e0dc362ED7C18973E24e13",
    foundaryTokenAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
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
