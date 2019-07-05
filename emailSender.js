const sgMail = require("@sendgrid/mail");

const { sendGdrid } = require('./config');

const msgFinish = {
  to: "andrii@holzmann.enterprises",
  from: "info@about.HAndC",
  subject: "H&C daily finish",
  text: "Daily is over!"
};
const msgStart = {
  to: "andrii@holzmann.enterprises",
  from: "info@about.HAndC",
  subject: "H&C daily start",
  text: "Daily has begun!"
};

sgMail.setApiKey(sendGdrid);

module.exports = { sgMail, msgStart, msgFinish };
