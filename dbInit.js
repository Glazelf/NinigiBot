import userdata from './database/dbInit/userdata.init';
import serverdata from './database/dbInit/serverdata.init';
import minimist from 'minimist';
const initDB = async (reset_db) => {
    try {
        inits = [userdata(reset_db), serverdata(reset_db)];
        await Promise.all(inits);
    } catch (e) {
        console.log(e);
    };
};

(async function main() {
    let argv = minimist(process.argv.slice(2));
    if (argv.delete) {
        if (argv.delete.toLowerCase() == 'true') console.log('All data will be deleted');
        await initDB(true);
    } else {
        await initDB(false);
    };
})();