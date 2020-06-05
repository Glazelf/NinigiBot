module.exports.run = async (client, message) => {
    try {
        let SysbotID = "696086046685003786";
        let memberFetch = await message.guild.members.fetch();
        let SysbotIDFetch = memberFetch.filter(member => member.id == SysbotID);
        let SysbotStatus = SysbotIDFetch.filter(member => member.presence.status !== "offline").size;


        if (SysbotStatus == "1") {
            return message.channel.send(`> <@${SysbotID}> is currently: Online! 
> Check the pins in <#${client.config.botChannelID}> for more information on how to use it and a general FAQ.`);
        } else if (SysbotStatus == "0") {
            return message.channel.send(`> <@${SysbotID}> is currently: Offline! 
> Check the pins in <#${client.config.botChannelID}> for more information on when it might be back online.`);
        } else {
            return message.channel.send(`> Something seems to be going wrong, please check the status yourself for now: <@${SysbotID}>.`);
        };

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Sysbot",
    description: `Responds with a status update on <@696086046685003786>.`,
    usage: `sysbot`
};