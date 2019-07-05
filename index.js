const cron = require('node-cron');
const SimpleNodeLogger = require('simple-node-logger');

const { sgMail, msgStart, msgFinish } = require("./emailSender");
const { updateCustomers, updateOrderHdrs, updateOrderDtls, today } = require('./functions');

cron.schedule('50 7 * * *', async () => {

    const log = SimpleNodeLogger.createSimpleLogger({
        logFilePath: `logs/${today()}.log`,
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    });
    
    log.info(today() + " CRON JOB STARTED");
    sgMail.send(msgStart);
    log.warn(" ========== CUSTOMERS TABLE ========== ");
    await updateCustomers(log);
    log.warn(" ========== ORDER HEADERS TABLE ========== ");
    await updateOrderHdrs(log);
    log.warn(" ========== ORDER DETAILS TABLE ========== ");
    await updateOrderDtls(log);
    sgMail.send(msgFinish);
    log.info("CRON JOB ENDED");
});
