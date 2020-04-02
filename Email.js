const aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ apiVersion: "2012-08-10" });
aws.config.update({ region: "us-east-1" });
exports.emailing = function (event, context, callback) {
    let message = event.Records[0].Sns.Message;
    console.log("message -> " + message);
    let messageJson = JSON.parse(message);
  
    const domain = process.env.SourceEmailAddress.substring(process.env.SourceEmailAddress.lastIndexOf("@") +1);
    const dbName = process.env.DynamodbName;
    console.log(domain);
    console.log(dbName);
  
    let messageUrls = messageJson.urls;
    console.log("messageUrls  -> ", messageUrls);
  
    
};