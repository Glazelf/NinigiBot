exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) {
        return message.channel.send(client.config.lackPerms)
    }
    let member= msg.mentions.members.first();
    if(!member) return msg.reply("You have not mentioned a member to mute, please specify a target.");
    let muteRole = msg.guild.roles.find("name", "Muted");
    if(!muteRole) return msg.reply(`There is no "Muted" role, please create one.`);
    let params = msg.content.split(" ").slice(1);
    let time = params[1];
    if(!time) return msg.reply("There was no time specified, please specify an amount of time to mute for.");

    member.addRole(muteRole.id);
    msg.channel.send(`You've been muted for ${ms(ms(time), {long: true})} ${member.user.tag}`);

    setTimeout(function(){
        member.removeRole(mute.id);
    }, ms(time))
};

module.exports.help = {
    name: "Mute",
    description: "Replies with the same message you sent.",
    usage: `mute [@target] [time]`
}; 