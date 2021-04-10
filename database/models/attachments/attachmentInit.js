const Sequelize = require('sequelize');
const config = require('../../../config.json');

const sequelize = new Sequelize('database', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/models/attachments/attachments.sqlite',
});

const ShinxQuotes = require('./shinxQuotes')(sequelize, Sequelize.DataTypes);

module.exports = async () => {
    try {
        await ShinxQuotes.sync({ force: true });

        const quotes = [
            ShinxQuotes.upsert({ quote: "thinks Manectric should not exist.", reaction: 6 }),
            ShinxQuotes.upsert({ quote: "read the final chapter of the Yoomking and is confused about the ending.", reaction: 2 }),
            ShinxQuotes.upsert({ quote: "thinks you are cute!", reaction: 14 }),
            ShinxQuotes.upsert({ quote: "thinks that if you don\'t love yourself how are you gonna love somebody else?", reaction: 6 }),
            ShinxQuotes.upsert({ quote: "got this new anime plot, basically...", reaction: 4 }),
            ShinxQuotes.upsert({ quote: "is sad because of Yanderedev code.", reaction: 0 }),
            ShinxQuotes.upsert({ quote: "thinks that you should Nitro boost Glaze\'s server if you don\'t already", reaction: 6 }),
            ShinxQuotes.upsert({ quote: "is worried about how far the sun is.", reaction: 0 }),
            ShinxQuotes.upsert({ quote: "got hit by a Pidgey. Oof!", reaction: 2 }),
            ShinxQuotes.upsert({ quote: "got scared of that Spinarak on your head!", reaction: 3 }),
            ShinxQuotes.upsert({ quote: "is thinking about chocolate. Ahhh sweet.", reaction: 4 }),
            ShinxQuotes.upsert({ quote: "told a joke. Seems to be funny...?", reaction: 5 }),
            ShinxQuotes.upsert({ quote: "doesnt\'t want you to have a girlfriend.", reaction: 6 }),
            ShinxQuotes.upsert({ quote: "is sad because people on this world are bad.", reaction: 7 }),
            ShinxQuotes.upsert({ quote: "wants 500 euros now. Damn.", reaction: 8 }),
            ShinxQuotes.upsert({ quote: "watched Bambie tonight and is now crying.", reaction: 9 }),
            ShinxQuotes.upsert({ quote: "is sorry about biting your shoes", reaction: 10 }),
            ShinxQuotes.upsert({ quote: "wants a remake of Pokémon Platinum...", reaction: 11 }),
            ShinxQuotes.upsert({ quote: "wants love, they\'re no longer asking.", reaction: 12 }),
            ShinxQuotes.upsert({ quote: "is trying to solve some equation.", reaction: 13 }),
            ShinxQuotes.upsert({ quote: "got happy just because you smiled!", reaction: 14 }),
            ShinxQuotes.upsert({ quote: "is happy to be alive!", reaction: 15 }),
            ShinxQuotes.upsert({ quote: "thinks you should be doing your homework...", reaction: 6 }),
            ShinxQuotes.upsert({ quote: "wants you to play The Legend of Heroes: Trails of Cold Steel", reaction: 15 }),
            ShinxQuotes.upsert({ quote: "watched Code Geass and is crying about the ending. Again.", reaction: 7 }),
            ShinxQuotes.upsert({ quote: "is singing something? ...? What was that? Dango?", reaction: 14 }),
            ShinxQuotes.upsert({ quote: "lost on VGC so he\'s rage quitting like a real japanese player!", reaction: 12 }),
            ShinxQuotes.upsert({ quote: "got voted off even though they did a medbay scan!", reaction: 12 }),

            //ShinxQuotes.upsert({ quote: "", reaction: }),
        ]
        await Promise.all(quotes);
        console.log('Attachments updated');
        sequelize.close();
    } catch (e) {
        console.log(e)
    };
};



