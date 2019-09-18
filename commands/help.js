const fs = require("fs");
const Discord = require("discord.js");

module.exports.run = async (bot, message, args, con) => {
    fs.readdir("./commands/", (err, files) => {
        if (err) console.error(err);

        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if (jsfiles.length <= 0) {
            console.log("No commands to load!");
            message.author.send("No commands to load!");
            return;
        };

        let namelist = "";
        let desclist = "";
        let usage = "";
        let full = "";

        let result = jsfiles.forEach((f, i) => {
            let props = require(`./${f}`);
            namelist = `**${props.help.name}**\n`;
            desclist = `Description: ${props.help.description}\n`;
            // one day i will fix this so i dont have to use ? 
            usage = `Usage: ?${props.help.usage}\n`;
            full += `${namelist}${desclist}${usage}\n`
        });

        // if not in dms, confirm command in channel
        if (message.channel.type !== "dm") {
            message.channel.send(`Help has been sent to your DMs, <@${message.member.user.id}>!`);
        };

        // send help text
        return message.author.send(full);
    });
};

module.exports.help = {
    name: "Help",
    description: "Sends you a private message with all the commands.",
    usage: `help`
};