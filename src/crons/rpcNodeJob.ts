export {};
var cron = require("node-cron");
import moment from "moment";
import { axiosService, rpcNodeService } from "../../services/index";

let rpcNodeJob = async function () {
  start();
};

async function start() {
  try {
    let task = cron.schedule("*/10 * * * * *", async () => {
      console.log(moment().utc(), ":::");
      triggerJobs();
    });

    task.start();
  } catch (e) {
    console.log(e);
  }
}

async function triggerJobs() {
  let data = await axiosService.getRpcNodes();
  console.log(data?.length);
  handleJob(data);
}

export function handleJob(data: any) {
  rpcNodeService.saveRpcNodes(data);
}
export default rpcNodeJob;
