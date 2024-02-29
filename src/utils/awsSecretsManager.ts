let AWS = require("aws-sdk");

let awsSecretsManager = async function () {
  return new Promise(async (resolve, reject) => {
    var client = new AWS.SecretsManager({
      region: process.env.REGION,
    });
    client.getSecretValue(
      { SecretId: process.env.SECRET_NAME },
      function (err: any, data: any) {
        if (err) {
          console.log("aws error: " + err);
          reject("");
        } else {
          if ("SecretString" in data) {
            let secret = data.SecretString;
            var secretJson = JSON.parse(secret);
            (global as any).AWS_ENVIRONMENT = {
              ...(global as any).AWS_ENVIRONMENT,
              ...secretJson,
            };
          } else {
          }
          resolve("");
        }
      }
    );
  });
};

export default awsSecretsManager;
