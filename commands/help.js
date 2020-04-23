module.exports.run = async (client, message) => {
    try {
        const fs = require("fs");

        fs.readdir("./commands/", (err, files) => {
            if (err) console.error(err);

            let jsfiles = files.filter(f => f.split(".").pop() === "js");
            if (jsfiles.length <= 0) {
                console.log("No commands to load!");
                message.author.send("> No commands to load!");
                return;
            };

            let namelist = "";
            let desclist = "";
            let usagelist = "";
            let full = "";

            let result = jsfiles.forEach((f, i) => {
                let props = require(`./${f}`);
                namelist = `> **${props.help.name}**\n`;
                desclist = `> Description: ${props.help.description}\n`;
                usagelist = `> Usage: ${client.config.prefix}${props.help.usage}\n\n`;
                if (props.help.name == null) namelist = "";
                if (props.help.description == null) desclist = "";
                if (props.help.usage == null) usagelist = "";
                full += `${namelist}${desclist}${usagelist}`;
            });

            // if not in dms, confirm command in channel
            if (message.channel.type !== "dm") {
                message.channel.send(`> Help has been sent to your DMs, <@${message.author.id}>!`);
            };

            // send help text
            return message.author.send(full);
        });

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
};