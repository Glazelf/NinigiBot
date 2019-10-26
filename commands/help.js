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
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
};