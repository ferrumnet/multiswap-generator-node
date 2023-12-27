import { RpcNode } from "../interfaces/index";
import { getRpcNodes } from "./axios.service";
let rpcNodes: [RpcNode];

export async function saveRpcNodes(data: [RpcNode]) {
  setRpcNodesData(data);
  getRpcNodes();
}

const setRpcNodesData = function (data: [RpcNode]) {
  rpcNodes = data;
};

export const getRpcNodesData = function () {
  return rpcNodes;
};

export const getRpcNodeByChainId = function (chainId: string): RpcNode {
  try {
    if (rpcNodes && rpcNodes.length) {
      return (global as any).rpcNodes.find(
        (item: any) => item.chainId === chainId
      );
    }
  } catch (e) {
    console.log(e);
  }
  return { chainId: chainId, url: "" };
};
