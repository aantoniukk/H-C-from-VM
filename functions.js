const axios = require('axios');
const trackviaApi = require('trackvia-api');
const _ = require('lodash');

const { TVAccessToken, TVApiKey } = require('./config');
const TrackVia = new trackviaApi(TVApiKey, TVAccessToken);

function solovueUrl(table){ 
    return `https://wholesale.hesterandcook.com/api/Transfer/${table}/?ApiKey=C7130B64-CA80-4FD0-9E5D-FBCA75D89E9F&LargeFileOk=true&AsOf=${yesterday()}`
}

async function updateOrderDtls(log){
    const rec = await axios.get(solovueUrl('OrderDtl'));
    const OrderDtlExport = rec.data.OrderDtlExport;
    log.info(`${OrderDtlExport.length} order details loaded; url: ${solovueUrl('OrderDtl')}`);

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
            i--;
            log.error(err);
        }
    }
}

async function updateCustomers(log){
    const rec = await axios.get(solovueUrl('Customer'));
    const CustomerExport = rec.data.CustomerExport;
    log.info(`${CustomerExport.length} order customers loaded; url: ${solovueUrl('Customer')}`);

    for(let i = 0; i<CustomerExport.length; i++) {
        log.warn(i);
        const record = CustomerExport[i];
        try{
            let {Id, ...customer} = record;
            customer.CustomerId = Id;
            const TVRecords = await TrackVia.getView(2098, {}, Id);
            log.warn(" -------- similar TrackVia records -------- ");
            log.info(TVRecords.data);
            const orderRecord = _.find(TVRecords.data, { 'CustomerId': Id.toString() });
            log.warn(` -------- ${Id} TrackVia record -------- `);
            log.info(orderRecord);
            if(orderRecord) {
                const newRec = await TrackVia.updateRecord(2098, orderRecord.id, customer)
                log.warn(` -------- Updated record ${orderRecord.id} -------- `);
                log.info(newRec.data);
            }else{
                const newRec = await TrackVia.addRecord(2098, customer);
                log.warn(" -------- Created record -------- ");
                log.info(newRec.data);
            }
        }catch(err){
            i--;
            log.error(err);
        }
    }
}

async function updateOrderHdrs(log){
    const rec = await axios.get(solovueUrl('OrderHdr'));
    const OrderHdrExport = rec.data.OrderHdrExport;
    log.info(`${OrderHdrExport.length} order headers loaded; url: ${solovueUrl('OrderHdr')}`);

    
    for(let i = 0; i<OrderHdrExport.length; i++) {
        log.warn(i);
        let {TermsId, ...record} = OrderHdrExport[i];
        try{
            const recordId = record.OrderHdrId;
            const TVRecords = await TrackVia.getView(2099, {}, recordId);
            log.warn(" -------- similar TrackVia records -------- ");
            log.info(TVRecords.data);
            const orderRecord = _.find(TVRecords.data, { 'OrderHdrId': recordId.toString() });
            log.warn(" -------- recordId TrackVia record -------- ");
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
            i--;
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