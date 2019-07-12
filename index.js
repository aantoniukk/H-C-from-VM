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
    html: `<p>
    The Hester & Cook daily data migration has completed successfully. Please
    contact us if you have any questions or concerns!
  </p>
  <hr />
  <body style="width: 500px;">
    <h3>Start date/time: ${currentTime()}</h3>
    <h3>Finish date/time: ${currentTime()}</h3>
    <hr />
    <div style="width:65%; text-align: rigth;">
      <h3 style="margin-left: 37px;">Customer</h3>
      <h4>Added ${countCustomer.added}</h4>
      <h4>Updated ${countCustomer.updated}</h4>
      <h3 style="margin-left: 37px;">Order headers</h3>
      <h4>Added ${countOrdHdr.added}</h4>
      <h4>Updated ${countOrdHdr.updated}</h4>
      <h3 style="margin-left: 37px;">Order details</h3>
      <h4>Added ${countDtl.added}</h4>
      <h4>Updated ${countDtl.updated}</h4>
    </div>
    <hr />
  </body>`
  });
  log.info("CRON JOB ENDED");
});
