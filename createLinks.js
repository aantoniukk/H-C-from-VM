const trackviaApi = require('trackvia-api');

const { TVAccessToken, TVApiKey } = require('./config');
const TrackVia = new trackviaApi(TVApiKey, TVAccessToken);

async function a(){
    try{
        let TVRecords = await TrackVia.getView(2688);
        console.log(`Total records ${TVRecords.totalCount}`);

        while(TVRecords.totalCount){
            const recs = TVRecords.data;

            for( let record of recs ){
                console.log(` -------- UPDATING ID: ${record.id} -------- `);
                const newRec = await TrackVia.updateRecord( 2100, record.id, { Update: 'Create link' });
                console.warn(`Updated record ${newRec.data[0].id}`);
            }

            TVRecords = await TrackVia.getView(2688);
            console.log(TVRecords.totalCount);
        }
    }catch(err){
        console.log(err);
    }

    console.log('Script stoped.');
    
}

a();