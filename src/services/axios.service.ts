var axios = require("axios").default;

export let getTransactions = async function () {
  try {
    let baseUrl = (global as any as any).AWS_ENVIRONMENT
      .BASE_URL_MULTISWAP_BACKEND;
    if (process.env.ENVIRONMENT == "local") {
      baseUrl = "http://localhost:8080";
    }
    let url = `${baseUrl}/api/v1/transactions/list?status=swapPending&isPagination=false`;
    let res = await axios.get(url);
    return res.data.body.transactions;
  } catch (error) {
    console.log(error);
    return null;
  }
};
