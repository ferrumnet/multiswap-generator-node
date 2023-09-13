import { addWorker } from "./..//utils/crons/transactionsJob";

export const createJob = async (transaction: any): Promise<any> => {
  if (transaction) {
    addWorker(transaction);
  }
  return null;
};
