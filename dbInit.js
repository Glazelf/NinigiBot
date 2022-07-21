const initDB = async (reset_db) => {
    try {
        await require('./database/dbInit/full.init')(reset_db);
        await require('./database/dbInit/server.init')(reset_db);
    } catch (e) {
        console.log(e)
    };
};

let argv = require('minimist')(process.argv.slice(2));
if(argv.delete){
    if(argv.delete.toLowerCase()=='true')
    console.log('All data will be deleted')
    initDB(true);
} else {
    initDB(false);
}

