import { addWorker } from "./..//utils/crons/transactionsJob";

export const createJob = async (transaction: any): Promise<any> => {
  addWorker(transaction);
  return null;
};
