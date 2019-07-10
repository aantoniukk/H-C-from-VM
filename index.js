const cron = require("node-cron");
const SimpleNodeLogger = require("simple-node-logger");

const { sgMail, msgStart } = require("./emailSender");
const {
  updateCustomers,
  updateOrderHdrs,
  updateOrderDtls,
  today,
  currentTime
} = require("./functions");

cron.schedule("17 7 * * *", async () => {
  const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath: `logs/${today()}.log`,
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS"
  });

  log.info(today() + " CRON JOB STARTED");
  sgMail.send(msgStart);
  log.warn(" ========== CUSTOMERS TABLE ========== ");
  const countCustomer = await updateCustomers(log);
  log.warn(" ========== ORDER HEADERS TABLE ========== ");
  const countOrdHdr = await updateOrderHdrs(log);
  log.warn(" ========== ORDER DETAILS TABLE ========== ");
  const countDtl = await updateOrderDtls(log);
  sgMail.send({
    to: [
      "andrii@holzmann.enterprises",
      "tgonchar@basquare.com",
      "nathaniel@holzmann.enterprises"
    ],
    from: "donotreply@holzmann.enterprises",
    subject: "H&C Daily Data Migration Log",
    text:
      "We've finished the daily migration of data from SoloVue to TrackVia.",
    html: `<body style="width: 500px;">
          <h3>Start time/date: 7:50, ${today()}</h3>
          <h3>Finish date/time: ${currentTime()}, ${today()}</h3>
          <table style="width:50%; text-align: center;">
        <tr>
          <th></th>
          <th>Customer</th>
          <th>Order Headers</th>
          <th>order Details</th>
        </tr>
        <tr>
          <td>Added</td>
          <td>${countCustomer.added}</td>
          <td>${countOrdHdr.added}</td>
          <td>${countDtl.added}</td>
        </tr>
        <tr>
          <td>Updated</td>
          <td>${countCustomer.updated}</td>
          <td>${countOrdHdr.updated}</td>
          <td>${countDtl.updated}</td>
        </tr>
      </table>
      </body>
          `
  });
  log.info("CRON JOB ENDED");
});
