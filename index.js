const cron = require('node-cron');
const SimpleNodeLogger = require('simple-node-logger');
const { updateCustomers, updateOrderHdrs, updateOrderDtls, today } = require('./functions');

const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath: `logs/${today()}.log`,
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

cron.schedule('0 0 10 * * *', async () => {
    log.info('CRON JOB STARTED');

    log.warn(' ========== CUSTOMERS TABLE ========== ');
    await updateCustomers(log);
    log.warn(' ========== ORDER HEADERS TABLE ========== ');
    await updateOrderHdrs(log);
    log.warn(' ========== ORDER DETAILS TABLE ========== ');
    await updateOrderDtls(log);

    log.info('CRON JOB ENDED');
});
