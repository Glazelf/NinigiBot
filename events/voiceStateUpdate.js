module.exports = async (client, oldMember, newMember) => {
    try {
        const Discord = require("discord.js");
        const { VCTextChannels } = require('../database/dbObjects');
        let oldID = null;
        let newID = null;
        if (oldMember.channelId) oldID = oldMember.channelId;
        if (newMember.channelId) newID = newMember.channelId;

        let user = client.users.cache.get(newMember.id);
        if (user.bot) return;
        let VCTextChannel = await VCTextChannels.findOne({ where: { server_id: newMember.guild.id } });
        if (!VCTextChannel) return;
        await newMember.guild.channels.fetch();
        let textChannel = newMember.guild.channels.cache.find(channel => channel.id == VCTextChannel.channel_id);
        if (!textChannel) return;
        await textChannel.fetch();
        let channelPermOverride = await textChannel.permissionOverwrites.cache.get(newMember.id);
        if (!channelPermOverride) channelPermOverride = await textChannel.permissionOverwrites.cache.get(oldMember.id);

        // Joined VC
        if (newID) {
            if (channelPermOverride) {
                try {
                    return channelPermOverride.edit({
                        VIEW_CHANNEL: true,
                        READ_MESSAGE_HISTORY: true, user: user
                    });
                } catch (e) {
                    console.log(e);
                };
            } else {
                try {
                    return textChannel.permissionOverwrites.set([
                        {
                            id: user.id,
                            allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL, Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY]
                        }
                    ]);
                } catch (e) {
                    console.log(e);
                };
            };
            //Left VC
        } else if (oldID) {
            if (channelPermOverride) {
                return channelPermOverride.delete();
            } else {
                return;
            };
        };

    } catch (e) {
        // log error
        console.log(e);
    };
};