const Sequelize = require('sequelize');
const config = require('./config.json');

const sequelize = new Sequelize('database', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/database.sqlite',
});

//Initialize other databases
require('./database/models/attachments/attachmentInit')()

const EligibleRoles = require('./database/models/server/EligibleRoles')(sequelize, Sequelize.DataTypes);
const PersonalRoles = require('./database/models/server/PersonalRoles')(sequelize, Sequelize.DataTypes);
const PersonalRoleServers = require('./database/models/global/PersonalRoleServers')(sequelize, Sequelize.DataTypes);
const ModEnabledServers = require('./database/models/global/ModEnabledServers')(sequelize, Sequelize.DataTypes);
const LogChannels = require('./database/models/global/LogChannels')(sequelize, Sequelize.DataTypes);
const StarboardChannels = require('./database/models/global/StarboardChannels')(sequelize, Sequelize.DataTypes);
const StarboardMessages = require('./database/models/global/StarboardMessages')(sequelize, Sequelize.DataTypes);
const StarboardLimits = require('./database/models/server/StarboardLimits')(sequelize, Sequelize.DataTypes);

const syncDatabase = async () => {
    try {
        await EligibleRoles.sync({ alter: true });
        await PersonalRoles.sync({ alter: true });
        await PersonalRoleServers.sync({ alter: true });
        await ModEnabledServers.sync({ alter: true });
        await LogChannels.sync({ alter: true });
        await StarboardChannels.sync({ alter: true });
        await StarboardMessages.sync({ alter: true });
        await StarboardLimits.sync({ alter: true });

        sequelize.close();
    } catch (e) {
        console.log(e)
    };
};

syncDatabase();
