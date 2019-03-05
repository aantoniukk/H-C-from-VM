const axios = require('axios');
const trackviaApi = require('trackvia-api');
const _ = require('lodash');

const { TVAccessToken, TVApiKey } = require('./config');
const TrackVia = new trackviaApi(TVApiKey, TVAccessToken);

function solovueUrl(table){ 
    return `https://wholesale.hesterandcook.com/api/Transfer/${table}/?ApiKey=C7130B64-CA80-4FD0-9E5D-FBCA75D89E9F&LargeFileOk=true&AsOf=${yesterday()}`
}

async function updateCustomers(log){
    const rec = await axios.get(solovueUrl('Customer'));
    const CustomerExport = rec.data.CustomerExport;
    log.info(`${CustomerExport.length} order customers loaded; url: ${solovueUrl('Customer')}`);

    let tries = 0;
    for(let i = 0; i<CustomerExport.length; i++) {
        const record = CustomerExport[i];
        log.warn(` -------- ${i} customer record -------- `);
        log.info(record);

        try{
            let {Id, ...customer} = record;
            customer.CustomerId = Id;
            log.info(`searching for ${Id} recordId`);
            const TVRecords = await TrackVia.getView(2098, {}, Id);
            log.warn(` -------- ${TVRecords.data.length} similar TrackVia records -------- `);
            const orderRecord = _.find(TVRecords.data, { 'CustomerId': Id.toString() });

            if(orderRecord) {
                log.warn(` -------- ${Id} TrackVia record -------- `);
                log.info(orderRecord);
                const newRec = await TrackVia.updateRecord(2098, orderRecord.id, customer)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                log.warn(` -------- No TrackVia record exists yet -------- `);
                const newRec = await TrackVia.addRecord(2098, customer);
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
    log.info(`${OrderHdrExport.length} order headers loaded; url: ${solovueUrl('OrderHdr')}`);
   
    let tries = 0;
    for(let i = 0; i<OrderHdrExport.length; i++) {
        let {TermsId, ...record} = OrderHdrExport[i];
        log.warn(` -------- ${i} order header record -------- `);
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
    log.info(`${OrderDtlExport.length} order details loaded; url: ${solovueUrl('OrderDtl')}`);

    let tries = 0;
    for(let i = 0; i<OrderDtlExport.length; i++) {
        const record = OrderDtlExport[i];
        log.warn(` -------- ${i} order detail record -------- `);
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
                log.error(` !!!!!!!!! ERROR UPDATING OrderDtlId:${record.OrderDtlId} RECORD !!!!!!!!! `);
            }
            log.error(err);
        }
    }
}

module.exports = { 
    updateCustomers, 
    updateOrderHdrs, 
    updateOrderDtls,
    today 
}

function addZeroToDate(num){
    return num < 10 ? '0'+num.toString() : num.toString();
}

function yesterday(){
    const date = new Date();
    date.setDate(date.getDate()-1);
    
    return addZeroToDate(date.getFullYear()) + '-' + addZeroToDate(date.getMonth()+1) + '-' + addZeroToDate(date.getDate());
}

function today(){
    const date = new Date();
    
    return addZeroToDate(date.getFullYear()) + '-' + addZeroToDate(date.getMonth()+1) + '-' + addZeroToDate(date.getDate());
}