const aws = require("aws-sdk");
var myDyanamoDB = new aws.DynamoDB({ apiVersion: "2012-08-10" });
aws.config.update({ region: "us-east-1" });
exports.emailing = function (event, context, callback) {
    let message = event.Records[0].Sns.Message;
    console.log("message -> " + message);
    let messageJson = JSON.parse(message);
  
    const domain = process.env.SourceEmailAddress.substring(process.env.SourceEmailAddress.lastIndexOf("@") +1);
    const dbName = process.env.DynamodbName;
    console.log(domain);
    console.log(dbName);
  
    let messageUrls = messageJson.linksArray;
    console.log("messageUrls  -> ", messageUrls);
  
    let emailBody = "Below Bills are due: \n\n";
  for (var i = 0; i < messageUrls.length; i++) {
    let link = messageUrls[i];
    emailBody += link + " \n";
  }

  let ttl = 1 * 60 * 60 * 1000;
  let currentTime = new Date().getTime();
  let expTime = (currentTime + ttl).toString();


  console.log(emailBody);

  let allParamsForEmail = {
    Destination: {
      ToAddresses: [
        messageJson.email_address
      ]
    },
    Message: {
      Body: {

        Text: {
          Charset: "UTF-8",
          Data: emailBody
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "You have These Bills DUE!"
      }
    },
    Source: process.env.SourceEmailAddress
  };

  let putDynamoParams = {
    TableName: process.env.DynamodbName,
    Item: {
      id: { S: messageJson.email_address },
      ttl: { N: expTime }
    }
  };
  console.log("putDynamoParams -> "+ putDynamoParams);
  let queryDynamoParams = {
    TableName: process.env.DynamodbName,
    Key: {
      'id': { S: messageJson.email_address }
    },
  }
  console.log("queryDynamoParams"+ queryDynamoParams);
  myDyanamoDB.getItem(queryDynamoParams, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log("Dynamo DB data -> " + data);
      if (data.Item == null) {
        myDyanamoDB.putItem(putDynamoParams, function (error, result) {
          if (error) {
            console.log("Error in putting data " + error)
          }
          else {
            console.log("data added to dynamo db table " + result)
            var sendPromise = new aws.SES({ apiVersion: '2010-12-01' }).sendEmail(allParamsForEmail).promise();
            sendPromise.then(
              function (data) {
                console.log("Email sent! ID =" + data.MessageId);
              }).catch(
                function (err) {
                  console.error(err, err.stack);
                });
          }
        })
      }
      else {
        console.log("Email ID exists!");
      }
    }
  })
    
};