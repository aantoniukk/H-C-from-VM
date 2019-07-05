const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'andrii@holzmann.enterprises',
    pass: 'becsfqdbdzdidpmu'
  }
});
const mailOptionStarted = {
  to: 'andrii@holzmann.enterprises',
  subject: 'H&C daily start',
  text: 'Daile has begun!'
};

const mailOptionFinished = {
  to: 'andrii@holzmann.enterprises',
  subject: 'H&C daily finish',
  text: 'Daily is over!'
};

module.exports = { transporter, mailOptionStarted, mailOptionFinished };
