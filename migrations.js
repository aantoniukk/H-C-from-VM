const axios = require('axios');
const trackviaApi = require('trackvia-api');
const _ = require('lodash');
const cron = require('node-cron');
const SimpleNodeLogger = require('simple-node-logger');

const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath: `logs/big-migration-03-2019.log`,
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

const { TVAccessToken, TVApiKey } = require('./config');
const TrackVia = new trackviaApi(TVApiKey, TVAccessToken);

function solovueUrl(table){ 
    return `https://wholesale.hesterandcook.com/api/Transfer/${table}/?ApiKey=C7130B64-CA80-4FD0-9E5D-FBCA75D89E9F&LargeFileOk=true&AsOf=2018-10-01`
}

async function updateOrderHdrs(log){
    const rec = await axios.get(solovueUrl('OrderHdr'));
    const OrderHdrExport = rec.data.OrderHdrExport;
    log.info(`${OrderHdrExport.length} order headers loaded; url: ${solovueUrl('OrderHdr')}`);
   
    let tries = 0;
    for(let i = 0; i<OrderHdrExport.length; i++) {
        log.warn(i);
        let {TermsId, ...record} = OrderHdrExport[i];
        try{
            const recordId = record.OrderHdrId;
            const TVRecords = await TrackVia.getView(2099, {}, recordId);
            log.warn(" -------- similar TrackVia records -------- ");
            log.info(TVRecords.data);
            const orderRecord = _.find(TVRecords.data, { 'OrderHdrId': recordId.toString() });
            log.warn(` -------- ${recordId} TrackVia record -------- `);
            log.info(orderRecord);
            if(orderRecord) {
                const newRec = await TrackVia.updateRecord(2099, orderRecord.id, record)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                const newRec = await TrackVia.addRecord(2099, record);
                log.warn(" -------- Created record -------- ");
                log.info(newRec.data);
            }
        }catch(err){
            if(tries<5){
                tries++;
                i--;
            } else {
                tries = 0;
                log.error(` !!!!!!!!! ERROR UPDATING OrderHdrId:${record.OrderHdrId} RECORD !!!!!!!!! `);
            }

            log.error(err);
        }
    }
}

async function updateOrderDtls(log){
    const rec = await axios.get(solovueUrl('OrderDtl'));
    const OrderDtlExport = rec.data.OrderDtlExport;
    log.info(`${OrderDtlExport.length} order details loaded; url: ${solovueUrl('OrderDtl')}`);

    let tries = 0;
    for(let i = 0; i<OrderDtlExport.length; i++) {
        log.warn(i);
        const record = OrderDtlExport[i];
        try{
            const recordId = record.OrderDtlId;
            const TVRecords = await TrackVia.getView(2100, {}, recordId);
            log.warn(" -------- similar TrackVia records -------- ");
            log.info(TVRecords.data);
            const orderRecord = _.find(TVRecords.data, { 'OrderDtlId': recordId.toString() });
            log.warn(` -------- ${recordId} TrackVia record -------- `);
            log.info(orderRecord);
            if(orderRecord) {
                const newRec = await TrackVia.updateRecord(2100, orderRecord.id, record)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                const newRec = await TrackVia.addRecord(2100, record);
                log.warn(" -------- Created record -------- ");
                log.info(newRec.data);
            }
        }catch(err){
            if(tries<5){
                tries++;
                i--;
            } else {
                tries = 0;
                log.error(` !!!!!!!!! ERROR UPDATING OrderDtlId:${record.OrderDtlId} RECORD !!!!!!!!! `);
            }
            log.error(err);
        }
    }
}

const now = new Date();
console.log(now);

cron.schedule('0 30 16 28 2 *', async () => {
    log.warn(' ========== ORDER HEADERS TABLE ========== ');
    console.log('here starts script .... ');
    //await updateOrderHdrs(log);
    log.info('CRON JOB ENDED');
});

// cron.schedule('0 0 4 2 3 *', async () => {
//     log.warn(' ========== ORDER DETAILS TABLE ========== ');
//     await updateOrderDtls(log);
//     log.info('CRON JOB ENDED');
// });