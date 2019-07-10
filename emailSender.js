const sgMail = require("@sendgrid/mail");

const { sendGdrid } = require("./config");

const msgStart = {
  to: [
    "andrii@holzmann.enterprises",
    "tgonchar@basquare.com",
    "nathaniel@holzmann.enterprises"
  ],
  from: "info@about.HAndC",
  subject: "H&C Daily Data Migration Log (Start)",
  text: "Daily has begun!"
};

sgMail.setApiKey(sendGdrid);

module.exports = { sgMail, msgStart, msgFinish };
