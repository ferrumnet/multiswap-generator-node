export async function saveRpcNodes(data: any) {
  if (data && data.length > 0) {
    process.env.ENVIRONMENT.RPC_NODES = data
  } else {
    process.env.ENVIRONMENT.RPC_NODES = []
  }
}
