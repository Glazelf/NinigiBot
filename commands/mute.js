exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) {
        return message.channel.send(client.config.lackPerms)
    }
    let member= message.mentions.members.first();
    if(!member) return message.reply("You have not mentioned a member to mute, please specify a target.");
    let muteRole = message.guild.roles.find("name", "Muted");
    if(!muteRole) return message.reply(`There is no "Muted" role, please create one.`);
    let params = message.content.split(" ").slice(1);
    let time = params[1];
    if(!time) return message.reply("There was no time specified, please specify an amount of time to mute for.");

    member.addRole(muteRole.id);
    message.channel.send(`You've been muted for ${ms(ms(time), {long: true})} ${member.user.tag}`);

    setTimeout(function(){
        member.removeRole(mute.id);
    }, ms(time))
};

module.exports.help = {
    name: "Mute",
    description: "Replies with the same message you sent.",
    usage: `mute [@target] [time]`
}; 