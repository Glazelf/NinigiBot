const initDB = async (reset_db) => {
    try {
        inits = [ require('./database/dbInit/userdata.init')(reset_db),
                require('./database/dbInit/serverdata.init')(reset_db)];
        await Promise.all(inits);
    } catch (e) {
        console.log(e)
    };
};



(async function main () {
    let argv = require('minimist')(process.argv.slice(2));
    if(argv.delete){
        if(argv.delete.toLowerCase()=='true')
        console.log('All data will be deleted')
        await initDB(true);
    } else {
        await initDB(false);
    }
})();