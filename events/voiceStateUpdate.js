module.exports = async (client, oldMember, newMember) => {
    try {
        console.log("voice statse")
        const { VCTextChannels } = require('../database/dbObjects');
        let oldID = null;
        let newID = null;
        if (oldMember.channelID) oldID = oldMember.channelID;
        if (newMember.channelID) newID = newMember.channelID;

        let user = client.users.cache.get(newMember.id);
        if (user.bot) return;
        console.log(`user bot ${user.bot}`)

        let VCTextChannel = await VCTextChannels.findOne({ where: { server_id: newMember.guild.id } });
        console.log(`vctextchannel ${VCTextChannel}`)
        if (!VCTextChannel) return;
        await newMember.guild.channels.fetch();
        let textChannel = newMember.guild.channels.cache.find(channel => channel.id == VCTextChannel.channel_id);
        console.log(`textchannel ${textChannel}`)
        if (!textChannel) return;
        await textChannel.fetch();
        let channelPermOverride = await textChannel.permissionOverwrites.cache.get(newMember.id);

        // Joined VC
        if (newID) {
            if (channelPermOverride) {
                try {
                    await channelPermOverride.edit({
                        VIEW_CHANNEL: true,
                        READ_MESSAGE_HISTORY: true, user: user
                    });
                    return;
                } catch (e) {
                    console.log(e);
                };
            } else {
                try {
                    await textChanel.permissionOverwrites.set([
                        {
                            id: user.id,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY]
                        }
                    ]);
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