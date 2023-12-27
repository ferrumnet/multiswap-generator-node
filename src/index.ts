import dotenv from "dotenv";
import app from "./app";
import awsSecretsManager from "./utils/awsSecretsManager";
import { transactionsJob, rpcNodeJob } from "./crons/index";
dotenv.config();

(async () => {
  await awsSecretsManager();
  rpcNodeJob.rpcNodeJob();
  transactionsJob.transactionsJob();
})().catch((e) => {
  console.log(e);
});

const server = app.listen(process.env.PORT, () => {
  console.info(`Listening to port ${process.env.PORT}`);
});
