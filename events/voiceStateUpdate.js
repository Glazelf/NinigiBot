module.exports = async (client, oldMember, newMember) => {
    try {
        const { VCTextChannels } = require('../database/dbObjects');
        let oldID = null;
        let newID = null;
        if (oldMember.channelID) oldID = oldMember.channelId;
        if (newMember.channelID) newID = newMember.channelId;

        let user = client.users.cache.get(newMember.id);
        if (user.bot) return;
        let VCTextChannel = await VCTextChannels.findOne({ where: { server_id: newMember.guild.id } });
        if (!VCTextChannel) return;
        await newMember.guild.channels.fetch();
        let textChannel = newMember.guild.channels.cache.find(channel => channel.id == VCTextChannel.channel_id);
        if (!textChannel) return;
        await textChannel.fetch();
        let channelPermOverride = await textChannel.permissionOverwrites.cache.get(newMember.id);
        console.log("voice state 438")

        // Joined VC
        if (newID) {
            if (channelPermOverride) {
                try {
                    console.log("4")
                    await channelPermOverride.edit({
                        VIEW_CHANNEL: true,
                        READ_MESSAGE_HISTORY: true, user: user
                    });
                    console.log("34")
                    return;
                } catch (e) {
                    console.log(e);
                };
            } else {
                try {
                    console.log("357")
                    await textChanel.permissionOverwrites.set([
                        {
                            id: user.id,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY]
                        }
                    ]);
                    console.log("58")
                    return;
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