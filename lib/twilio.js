var config = require('./config');

const sendSms = (phone, message) => {
  const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
  client.messages
    .create({
       body: message,
       from: config.twilio.fromPhone,
       to: '+91'+phone
     })
    .then(message => console.log(message.sid));
}

module.exports = sendSms;