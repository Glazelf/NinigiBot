const Sequelize = require('sequelize');
const { attatchments } =  require('../dbConnection/dbConnection');

const {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, ModEnabledServers, LogChannels, StarboardChannels, StarboardLimits, StarboardMessages} = require('../dbObjects/server.model')(attatchments, Sequelize.DataTypes);

module.exports = async (reset_db) => {
    try {
        if(reset_db) {
            await attatchments.drop()
            console.log(`Deleted Database: Attachments ✔`);
        }
        await EligibleRoles.sync({ alter: true });
        await PersonalRoles.sync({ alter: true });
        await PersonalRoleServers.sync({ alter: true });
        await ModEnabledServers.sync({ alter: true });
        await LogChannels.sync({ alter: true });
        await StarboardChannels.sync({ alter: true });
        await StarboardMessages.sync({ alter: true });
        await StarboardLimits.sync({ alter: true });
        await shinxQuotes.sync({ force: true });

        const quotes = [
            shinxQuotes.upsert({ quote: "thinks Manectric should not exist.", reaction: 6 }),
            shinxQuotes.upsert({ quote: "read the final chapter of the Yoomking and is confused about the ending.", reaction: 2 }),
            shinxQuotes.upsert({ quote: "thinks you are cute!", reaction: 14 }),
            shinxQuotes.upsert({ quote: "thinks that if you don\'t love yourself how are you gonna love somebody else?", reaction: 6 }),
            shinxQuotes.upsert({ quote: "got this new anime plot, basically...", reaction: 4 }),
            shinxQuotes.upsert({ quote: "is sad because of Yanderedev code.", reaction: 0 }),
            shinxQuotes.upsert({ quote: "thinks that you should Nitro boost Glaze\'s server if you don\'t already", reaction: 6 }),
            shinxQuotes.upsert({ quote: "is worried about how far the sun is.", reaction: 0 }),
            shinxQuotes.upsert({ quote: "got hit by a Pidgey. Oof!", reaction: 2 }),
            shinxQuotes.upsert({ quote: "got scared of that Spinarak on your head!", reaction: 3 }),
            shinxQuotes.upsert({ quote: "is thinking about chocolate. Ahhh sweet.", reaction: 4 }),
            shinxQuotes.upsert({ quote: "told a joke. Seems to be funny...?", reaction: 5 }),
            shinxQuotes.upsert({ quote: "doesnt\'t want you to have a girlfriend.", reaction: 6 }),
            shinxQuotes.upsert({ quote: "is sad because people on this world are bad.", reaction: 7 }),
            shinxQuotes.upsert({ quote: "wants 500 euros now. Damn.", reaction: 8 }),
            shinxQuotes.upsert({ quote: "watched Bambie tonight and is now crying.", reaction: 9 }),
            shinxQuotes.upsert({ quote: "is sorry about biting your shoes", reaction: 10 }),
            shinxQuotes.upsert({ quote: "wants a remake of Pokémon Platinum...", reaction: 11 }),
            shinxQuotes.upsert({ quote: "wants love, they\'re no longer asking.", reaction: 12 }),
            shinxQuotes.upsert({ quote: "is trying to solve some equation.", reaction: 13 }),
            shinxQuotes.upsert({ quote: "got happy just because you smiled!", reaction: 14 }),
            shinxQuotes.upsert({ quote: "is happy to be alive!", reaction: 15 }),
            shinxQuotes.upsert({ quote: "thinks you should be doing your homework...", reaction: 6 }),
            shinxQuotes.upsert({ quote: "wants you to play The Legend of Heroes: Trails of Cold Steel", reaction: 15 }),
            shinxQuotes.upsert({ quote: "watched Code Geass and is crying about the ending. Again.", reaction: 7 }),
            shinxQuotes.upsert({ quote: "is singing something? ...? What was that? Dango?", reaction: 14 }),
            shinxQuotes.upsert({ quote: "lost on VGC so he\'s rage quitting like a real japanese player!", reaction: 12 }),
            shinxQuotes.upsert({ quote: "got voted off even though they did a medbay scan!", reaction: 12 }),

            //shinxQuotes.upsert({ quote: "", reaction: }),
        ]
        await Promise.all(quotes);
        console.log(`Initialized Database: Attachments ✔`);
        attatchments.close();
    } catch (e) {
        console.log(e)
    };
};



