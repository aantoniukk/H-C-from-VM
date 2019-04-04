const cron = require('node-cron');
const SimpleNodeLogger = require('simple-node-logger');
const { updateCustomers, updateOrderHdrs, updateOrderDtls, today } = require('./functions');

cron.schedule('0 10 8 * * *', async () => {
    const log = SimpleNodeLogger.createSimpleLogger({
        logFilePath: `logs/${today()}.log`,
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    });
    
    log.info(today() + ' CRON JOB STARTED');

    log.warn(' ========== CUSTOMERS TABLE ========== ');
    await updateCustomers(log);
    log.warn(' ========== ORDER HEADERS TABLE ========== ');
    await updateOrderHdrs(log);
    log.warn(' ========== ORDER DETAILS TABLE ========== ');
    await updateOrderDtls(log);

    log.info('CRON JOB ENDED');
});
