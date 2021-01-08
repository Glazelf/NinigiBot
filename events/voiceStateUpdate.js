module.exports = async (client, oldMember, newMember) => {
    try {
        if(newMember.hasPermission("MANAGE_CHANNELS")) return;
        const { VCTextChannels } = require('../database/dbObjects');
        let oldID = null;
        let newID = null;
        if (oldMember.channelID) oldID = oldMember.channelID;
        if (newMember.channelID) newID = newMember.channelID;

        let user = client.users.cache.get(newMember.id);

        let VCTextChannel = await VCTextChannels.findOne({ where: { server_id: newMember.guild.id } });
        if (!VCTextChannel) return;
        let textChannel = newMember.guild.channels.cache.find(channel => channel.id == VCTextChannel.channel_id);
        if (!textChannel) return;

        // Joined VC
        if (newID) {
            return textChannel.updateOverwrite(user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true
            });
            //Left VC
        } else if (oldID) {
            return textChannel.permissionOverwrites.get(newMember.id).delete();
        };

    } catch (e) {
        // log error
        console.log(e);
    };
};