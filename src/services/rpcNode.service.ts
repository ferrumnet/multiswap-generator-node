export async function saveRpcNodes(data: any) {
  if (data && data.length > 0) {
    process.env.RPC_NODES = data;
  } else {
    process.env.RPC_NODES = "";
  }
}
