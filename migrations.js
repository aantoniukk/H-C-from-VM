const axios = require('axios');
const trackviaApi = require('trackvia-api');
const _ = require('lodash');
const cron = require('node-cron');
const SimpleNodeLogger = require('simple-node-logger');

const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath: `logs/migration-2019-06-30.log`,
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

const { TVAccessToken, TVApiKey } = require('./config');
const TrackVia = new trackviaApi(TVApiKey, TVAccessToken);

function solovueUrl(table){ 
    return `https://wholesale.hesterandcook.com/api/Transfer/${table}/?ApiKey=C7130B64-CA80-4FD0-9E5D-FBCA75D89E9F&LargeFileOk=true&AsOf=2019-06-30`
}

async function updateCustomers(log){
    const rec = await axios.get(solovueUrl('Customer'));
    const CustomerExport = rec.data.CustomerExport;
    const recordsNumber = CustomerExport.length;
    log.info(`${recordsNumber} order customers loaded; url: ${solovueUrl('Customer')}`);
    log.info(CustomerExport);

    let tries = 0;
    for(let i = 0; i<recordsNumber; i++) {
        const record = CustomerExport[i];
        log.warn(` -------- ${i} customer record of ${recordsNumber} records -------- `);
        log.info(record);

        try{
            let {Id, ...customer} = record;
            customer.CustomerId = Id;
            log.info(`searching for ${Id} recordId`);
            const TVRecords = await TrackVia.getView(2675, {}, Id);
            log.warn(` -------- ${TVRecords.data.length} similar TrackVia records -------- `);
            const orderRecord = _.find(TVRecords.data, { 'CustomerId': Id.toString() });

            if(orderRecord) {
                log.warn(` -------- ${Id} TrackVia record -------- `);
                log.info(orderRecord);
                const newRec = await TrackVia.updateRecord(2675, orderRecord.id, customer)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                log.warn(` -------- No TrackVia record exists yet -------- `);
                const newRec = await TrackVia.addRecord(2675, customer);
                log.warn(" -------- Created record -------- ");
                log.info(newRec.data);
            }
        }catch(err){
            if(tries<5){
                tries++;
                i--;
            } else {
                tries = 0;
                log.error(` !!!!!!!!! ERROR UPDATING CustomerId:${record.Id} RECORD !!!!!!!!! `);
            }
            log.error(err);
        }
    }
}

async function updateOrderHdrs(log){
    const rec = await axios.get(solovueUrl('OrderHdr'));
    const OrderHdrExport = rec.data.OrderHdrExport;
    const recordsNumber = OrderHdrExport.length;
    log.info(`${recordsNumber} order headers loaded; url: ${solovueUrl('OrderHdr')}`);
    log.info(OrderHdrExport);
   
    let tries = 0;
    for(let i = 0; i<recordsNumber; i++) {
        let {TermsId, ...record} = OrderHdrExport[i];
        log.warn(` -------- ${i} order headers record of ${recordsNumber} records -------- `);
        log.info(record);
        
        try{
            const recordId = record.OrderHdrId;
            log.info(`searching for ${recordId} recordId`);
            const TVRecords = await TrackVia.getView(2099, {}, recordId);
            log.warn(` -------- ${TVRecords.data.length} similar TrackVia records found -------- `);
            const orderRecord = _.find(TVRecords.data, { 'OrderHdrId': recordId.toString() });
            
            if(orderRecord) {
                log.warn(` -------- ${orderRecord.id} TrackVia record -------- `);
                log.info(orderRecord);
                const newRec = await TrackVia.updateRecord(2099, orderRecord.id, record)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                log.warn(` -------- No TrackVia record exists yet -------- `);
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
    const recordsNumber = OrderDtlExport.length;
    log.info(`${recordsNumber} order details loaded; url: ${solovueUrl('OrderDtl')}`);
    log.info(OrderDtlExport);
   
    let tries = 0;
    for(let i = 0; i<recordsNumber; i++) {
        const record = OrderDtlExport[i];
        log.warn(` -------- ${i} order details record of ${recordsNumber} records -------- `);
        log.info(record);

        try{
            const recordId = record.OrderDtlId;
            log.info(`searching for ${recordId} recordId`);
            const TVRecords = await TrackVia.getView(2100, {}, recordId);
            log.warn(` -------- ${TVRecords.data.length} similar TrackVia records found -------- `);
            const orderRecord = _.find(TVRecords.data, { 'OrderDtlId': recordId.toString() });
            
            if(orderRecord) {
                log.warn(` -------- ${orderRecord.id} TrackVia record -------- `);
                log.info(orderRecord);
                const newRec = await TrackVia.updateRecord(2100, orderRecord.id, record)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                log.warn(` -------- No TrackVia record exists yet -------- `);
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

async function a () {
    log.info('CRON JOB STARTED');

    log.warn(' ========== CUSTOMERS TABLE ========== ');
    await updateCustomers(log);
    log.warn(' ========== ORDER HEADERS TABLE ========== ');
    await updateOrderHdrs(log);
    log.warn(' ========== ORDER DETAILS TABLE ========== ');
    await updateOrderDtls(log);

    log.info('CRON JOB ENDED');
}

a();
