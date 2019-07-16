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

cron.schedule("0 7 * * *", async () => {
  const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath: `logs/${today()}.log`,
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS"
  });
  const startDate = currentTime();
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
    html: `<p style="margin-bottom: 0px">
    The Hester & Cook daily data migration has completed successfully.
  </p>
  <p style="margin-top: 0px">Please contact us if you have any questions or concerns!</p>
  <hr />
  <body style="width: 500px;">
    <h3 style="text-align: left; margin-bottom: 0px;">Start Date/Time:</h3>
    <p style="margin-top: 0px;">${startDate}</p>
    <h3 style="text-align: left; margin-bottom: 0px;">Start Date/Time:</h3>
    <p style="margin-top: 0px;">${currentTime()}</p>
    <hr />
    <div style="width:65%; text-align: left;">
      <h3 style="text-align: left; margin-bottom: 0px;">Customers</h3>
      <p style="margin-top: 0px;">Added: ${countCustomer.added} <br>
      Updated: ${countCustomer.updated}</p>
      <h3 style="text-align: left; margin-bottom: 0px;">Order Headers</h3>
      <p style="margin-top: 0px;">Added: ${countOrdHdr.added} <br>
      Updated: ${countOrdHdr.updated}</p>
      <h3 style="text-align: left; margin-bottom: 0px;">Order Details</h3>
      <p style="margin-top: 0px;">Added: ${countDtl.added} <br>
      Updated: ${countDtl.updated}</p>
    </div>
  </body>`
  });
  log.info("CRON JOB ENDED");
});
