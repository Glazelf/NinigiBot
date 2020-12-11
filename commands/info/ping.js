exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        let pongString = `> Pong!'ed back at ${message.author} in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;

        // Peg Rae
        let targetUser = client.users.cache.get("232875725898645504");
        if(message.content.startsWith(`${globalVars.prefix}peg`) && message.author.id == client.config.ownerID) {
            await rae.send("Rawr x3 *nuzzles* how are you *pounces on you* you're so warm o3o *notices you have a bulge* o: someone's happy ;) *nuzzles your necky wecky~* murr~ hehehe *rubbies your bulgy wolgy* you're so big :oooo *rubbies more on your bulgy wolgy* it doesn't stop growing ·///· *kisses you and lickies your necky* daddy likies (; *nuzzles wuzzles* I hope daddy really likes $: *wiggles butt and squirms* I want to see your big daddy meat~ *wiggles butt* I have a little itch o3o *wags tail* can you please get my itch~ *puts paws on your chest* nyea~ its a seven inch itch *rubs your chest* can you help me pwease *squirms* pwetty pwease *sad face* I need to be punished *runs paws down your chest and bites lip* like I need to be punished really good~ *paws on your bulge as I lick my lips* I'm getting thirsty. I can go for some milk *unbuttons your pants as my eyes glow* you smell so musky :v *licks shaft* mmmm~ so musky *drools all over your cock* your daddy meat I like *fondles* Mr. Fuzzy Balls hehe *puts snout on balls and inhales deeply* oh god im so hard~ *licks balls* punish me daddy~ nyea~ *squirms more and wiggles butt* I love your musky goodness *bites lip* please punish me *licks lips* nyea~ *suckles on your tip* so good *licks pre of your cock* salty goodness~ *eyes role back and goes balls deep* mmmm~ *moans and suckles* o3o");
            return message.channel.send(`Successfully pegged ${targetUser.tag}, ${message.author}.`);
        };

        if (message.content.startsWith(`${globalVars.prefix}pig`) || message.content.startsWith(`${globalVars.prefix}pog`)) {
            pongString = pongString.split("n").join("");
            pauseString = pauseString.split("n").join("");
        };
        if (message.content[2] == "o") {
            pongString = pongString.split("o").join("i");
            pauseString = pauseString.split("o").join("i");
        };

        return message.channel.send(pauseString).then(m => m.edit(`${pongString} ${m.createdTimestamp - message.createdTimestamp}ms.`));

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "ping",
    description: "Pings bot",
    category: "info",
    aliases: ["pong", "pig", "pog", "peg"]
};