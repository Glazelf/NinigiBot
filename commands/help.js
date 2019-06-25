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
        }

        var namelist = "";
        var desclist = "";
        var usage = "";
        var full = "";

        let result = jsfiles.forEach((f, i) => {
            let props = require(`./${f}`);
            namelist = `**${props.help.name}**\n`;
            desclist = `Description: ${props.help.description}\n`;
            usage = `Usage: ${client.config.prefix}${props.help.usage}\n`;
            full += `${namelist}${desclist}${usage}\n`
        });
        // send help text
        message.author.send(`${full}`).catch(console.error);
    });
};

module.exports.help = {
    name: "help",
    description: "Sends you a private message with all the commands.",
    usage: `help`
};