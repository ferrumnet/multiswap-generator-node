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
    chainId: "56",
    fundManagerAddress: "0xd9B93DCAbaa1e68c1E8cc6c84d44e76040F78973",
    fiberRouterAddress: "0x5d79f457789c601d30de7171861b15ebfb097360",
    foundaryTokenAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  {
    chainId: "250",
    fundManagerAddress: "0x354CBFc2894d45a584a9Fd0223cf58495cE3cF7F",
    fiberRouterAddress: "0xAA209557B51C28a8D050fB500e67498EB3d1d92b",
    foundaryTokenAddress: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
  },
  {
    chainId: "137",
    fundManagerAddress: "0x1c0E4e27871162d350Ef66c275DFb02ca359f013",
    fiberRouterAddress: "0xffbf08c340d9c27aba8045eabfb88058d9c2f426",
    foundaryTokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  },
  {
    chainId: "42161",
    fundManagerAddress: "0xcfddF60db000D49d0F2dafd7eDB08Fca177F1A1E",
    fiberRouterAddress: "0x0d618f4632C135e05d9fD795bab021e7DD3187c4",
    foundaryTokenAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  },
  {
    chainId: "43114",
    fundManagerAddress: "0x81A536479Af0FE02Ec2aC6BB59Db305aa72a774f",
    fiberRouterAddress: "0x066599eD3abB7Eaf517119d376254af13871e5B1",
    foundaryTokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  },
  {
    chainId: "245022934",
    fundManagerAddress: "0xE6ff690CC7B91A2B626F7A76Fe507028bc1Eb12D",
    fiberRouterAddress: "0x2234157B16637AfA6f1A7C1C34b1b80D82b50D82",
    foundaryTokenAddress: "0xea6b04272f9f62f997f666f07d3a974134f7ffb9",
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
    console.log("decrypt error", e);
    return "";
  }
};

export const delay = function () {
  return new Promise((resolve) => {
    setTimeout(resolve, 30000);
  });
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
