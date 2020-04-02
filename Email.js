const aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ apiVersion: "2012-08-10" });
aws.config.update({ region: "us-east-1" });
exports.emailing = function (event, context, callback) {
  let message = event.Records[0].Sns.Message;
  console.log("message " + message);
  let messageJson = JSON.parse(message);
  console.log("messageJson " + messageJson);
};