const initDB = async () => {
    try {
        await require('./database/dbInit/full.init')();
        await require('./database/dbInit/server.init')();
    } catch (e) {
        console.log(e)
    };
};

initDB();
