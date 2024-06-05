import { serverdata } from "../dbConnection/dbConnection.js";
import serverdataModel from "../dbObjects/serverdata.model.js";

export default async (reset_db) => {
    try {
        const { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, ModEnabledServers, LogChannels, StarboardChannels, StarboardLimits, StarboardMessages } = await serverdataModel(serverdata);
        if (reset_db) {
            await serverdata.drop();
            console.log(`Deleted Database: Server Data ✔`);
        };
        await EligibleRoles.sync({ alter: true });
        await PersonalRoles.sync({ alter: true });
        await PersonalRoleServers.sync({ alter: true });
        await ModEnabledServers.sync({ alter: true });
        await LogChannels.sync({ alter: true });
        await StarboardChannels.sync({ alter: true });
        await StarboardMessages.sync({ alter: true });
        await StarboardLimits.sync({ alter: true });
        await shinxQuotes.sync({ force: true });

        await shinxQuotes.upsert({ quote: "thinks Manectric should not exist.", reaction: 6 });
        await shinxQuotes.upsert({ quote: "read the final chapter of the Yoomking and is confused about the ending.", reaction: 2 });
        await shinxQuotes.upsert({ quote: "thinks you are cute!", reaction: 14 });
        await shinxQuotes.upsert({ quote: "thinks that if you don\'t love yourself how are you gonna love somebody else?", reaction: 6 });
        await shinxQuotes.upsert({ quote: "got this new anime plot, basically...", reaction: 4 });
        await shinxQuotes.upsert({ quote: "is sad because of Yanderedev code.", reaction: 0 });
        await shinxQuotes.upsert({ quote: "thinks that you should Nitro boost Glaze\'s server if you don\'t already", reaction: 6 });
        await shinxQuotes.upsert({ quote: "is worried about how far the sun is.", reaction: 0 });
        await shinxQuotes.upsert({ quote: "got hit by a Pidgey. Oof!", reaction: 2 });
        await shinxQuotes.upsert({ quote: "got scared of that Spinarak on your head!", reaction: 3 });
        await shinxQuotes.upsert({ quote: "is thinking about chocolate. Ahhh sweet.", reaction: 4 });
        await shinxQuotes.upsert({ quote: "told a joke. Seems to be funny...?", reaction: 5 });
        await shinxQuotes.upsert({ quote: "doesnt\'t want you to have a girlfriend.", reaction: 6 });
        await shinxQuotes.upsert({ quote: "is sad because people on this world are bad.", reaction: 7 });
        await shinxQuotes.upsert({ quote: "wants 500 euros now. Damn.", reaction: 8 });
        await shinxQuotes.upsert({ quote: "watched Bambie tonight and is now crying.", reaction: 9 });
        await shinxQuotes.upsert({ quote: "is sorry about biting your shoes", reaction: 10 });
        await shinxQuotes.upsert({ quote: "wants a remake of Pokémon Platinum...", reaction: 11 });
        await shinxQuotes.upsert({ quote: "wants love, they\'re no longer asking.", reaction: 12 });
        await shinxQuotes.upsert({ quote: "is trying to solve some equation.", reaction: 13 });
        await shinxQuotes.upsert({ quote: "got happy just because you smiled!", reaction: 14 });
        await shinxQuotes.upsert({ quote: "is happy to be alive!", reaction: 15 });
        await shinxQuotes.upsert({ quote: "thinks you should be doing your homework...", reaction: 6 });
        await shinxQuotes.upsert({ quote: "wants you to play The Legend of Heroes: Trails of Cold Steel", reaction: 15 });
        await shinxQuotes.upsert({ quote: "watched Code Geass and is crying about the ending. Again.", reaction: 7 });
        await shinxQuotes.upsert({ quote: "is singing something? ...? What was that? Dango?", reaction: 14 });
        await shinxQuotes.upsert({ quote: "lost on VGC so he\'s rage quitting like a real japanese player!", reaction: 12 });
        await shinxQuotes.upsert({ quote: "got voted off even though they did a medbay scan!", reaction: 12 });

        serverdata.close();
        console.log(`Initialized Database: Server ✔`);

    } catch (e) {
        console.log(e);
    };
};